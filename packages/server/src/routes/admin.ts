import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { Router, type Request } from 'express';
import { z } from 'zod';

import { databaseFilePath } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const EXPORT_CONFIRMATION_TTL_MS = 60_000;
const exportConfirmationSchema = z.object({
  confirmed: z.literal(true),
});

const logAdminExportEvent = (event: 'confirm' | 'download', req: Request) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  console.info('[admin:db-export]', {
    event,
    userId: req.user?.id ?? null,
    ip: req.ip,
    userAgent: req.get('user-agent') ?? null,
    at: new Date().toISOString(),
  });
};

router.post('/export-db/confirm', requireAdmin, (req, res) => {
  const parsedBody = exportConfirmationSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Export confirmation is required.',
      },
    });
    return;
  }

  logAdminExportEvent('confirm', req);

  const token = crypto.randomUUID();
  req.session.adminDbExportConfirmation = {
    token,
    expiresAt: Date.now() + EXPORT_CONFIRMATION_TTL_MS,
  };

  res.status(200).json({
    data: {
      downloadUrl: `/api/admin/export-db?token=${encodeURIComponent(token)}`,
      expiresInMs: EXPORT_CONFIRMATION_TTL_MS,
    },
    error: null,
  });
});

router.get('/export-db', requireAdmin, (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  const confirmation = req.session.adminDbExportConfirmation;

  if (
    !token ||
    !confirmation ||
    confirmation.token !== token ||
    confirmation.expiresAt < Date.now()
  ) {
    delete req.session.adminDbExportConfirmation;
    res.status(403).json({
      data: null,
      error: {
        code: 'EXPORT_CONFIRMATION_REQUIRED',
        message: 'Confirm the export before downloading the database.',
      },
    });
    return;
  }

  delete req.session.adminDbExportConfirmation;
  logAdminExportEvent('download', req);

  if (!fs.existsSync(databaseFilePath)) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Database file not found.' },
    });
    return;
  }

  const filename = `book-club-${new Date().toISOString().slice(0, 10)}.db`;
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(path.resolve(databaseFilePath));
});

export const adminRouter = router;

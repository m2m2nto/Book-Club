import fs from 'node:fs';
import path from 'node:path';

import { Router } from 'express';

import { databaseFilePath } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/export-db', requireAdmin, (_req, res) => {
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

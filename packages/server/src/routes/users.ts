import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';
import { usersTable } from '../db/schema.js';

const router = Router();

const normalizeRole = (role: unknown) => {
  return role === 'admin' ? 'admin' : role === 'user' ? 'user' : null;
};

router.use(requireAdmin);

router.get('/', (_req, res) => {
  const users = db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      role: usersTable.role,
      active: usersTable.active,
      deletedAt: usersTable.deletedAt,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt)
    .all();

  res.json({ data: users, error: null });
});

router.post('/', (req, res) => {
  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const role = normalizeRole(req.body.role ?? 'user');

  if (!email || !name || !role) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name, email, and role are required.',
      },
    });
    return;
  }

  const existing = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();

  if (existing && !existing.deletedAt) {
    res.status(422).json({
      data: null,
      error: {
        code: 'DUPLICATE_EMAIL',
        message: 'A user with this email already exists.',
      },
    });
    return;
  }

  if (existing?.deletedAt) {
    db.update(usersTable)
      .set({
        name,
        role,
        active: true,
        deletedAt: null,
      })
      .where(eq(usersTable.id, existing.id))
      .run();

    const user = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, existing.id))
      .get();
    res.status(200).json({ data: user, error: null });
    return;
  }

  const created = db
    .insert(usersTable)
    .values({
      email,
      name,
      role,
      active: true,
    })
    .returning()
    .get();

  res.status(201).json({ data: created, error: null });
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = {};

  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid user id.' },
    });
    return;
  }

  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    updates.name = req.body.name.trim();
  }

  const role =
    req.body.role !== undefined ? normalizeRole(req.body.role) : undefined;
  if (role === null) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid role.' },
    });
    return;
  }
  if (role) {
    updates.role = role;
  }

  if (typeof req.body.active === 'boolean') {
    updates.active = req.body.active;
  }

  if (!Object.keys(updates).length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'No valid fields to update.',
      },
    });
    return;
  }

  const target = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();
  if (!target || target.deletedAt) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
    return;
  }

  db.update(usersTable).set(updates).where(eq(usersTable.id, id)).run();
  const updated = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();

  res.json({ data: updated, error: null });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid user id.' },
    });
    return;
  }

  const target = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();
  if (!target || target.deletedAt) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
    return;
  }

  db.update(usersTable)
    .set({
      active: false,
      deletedAt: new Date().toISOString(),
    })
    .where(eq(usersTable.id, id))
    .run();

  res.json({ data: { success: true }, error: null });
});

router.post('/:id/reactivate', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid user id.' },
    });
    return;
  }

  const target = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();
  if (!target) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
    return;
  }

  db.update(usersTable)
    .set({
      active: true,
      deletedAt: null,
    })
    .where(eq(usersTable.id, id))
    .run();

  const updated = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();
  res.json({ data: updated, error: null });
});

export const usersRouter = router;

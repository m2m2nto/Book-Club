import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db/client.js';
import { usersTable } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const userIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const userRoleSchema = z.enum(['admin', 'user']);

const createUserSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(200),
  role: userRoleSchema.default('user'),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    role: userRoleSchema.optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No valid fields to update.',
  });

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
  const parsedBody = createUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name, email, and role are required.',
      },
    });
    return;
  }

  const email = parsedBody.data.email.toLowerCase();
  const { name, role } = parsedBody.data;

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
  const parsedParams = userIdParamsSchema.safeParse(req.params);
  const parsedBody = updateUserSchema.safeParse(req.body);

  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid user id.' },
    });
    return;
  }

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'No valid fields to update.',
      },
    });
    return;
  }

  const { id } = parsedParams.data;
  const updates: Record<string, unknown> = {};

  if (parsedBody.data.name !== undefined) updates.name = parsedBody.data.name;
  if (parsedBody.data.role !== undefined) updates.role = parsedBody.data.role;
  if (parsedBody.data.active !== undefined) {
    updates.active = parsedBody.data.active;
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
  const parsedParams = userIdParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid user id.' },
    });
    return;
  }

  const { id } = parsedParams.data;
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
  const parsedParams = userIdParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid user id.' },
    });
    return;
  }

  const { id } = parsedParams.data;
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

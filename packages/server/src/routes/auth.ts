import type { ApiResponse } from '@book-club/shared';
import { eq } from 'drizzle-orm';
import { Router, type Response } from 'express';
import { z } from 'zod';

import {
  getLoginUserByEmail,
  toAuthenticatedUser,
  verifyPassword,
} from '../auth/password-auth.js';
import { db } from '../db/client.js';
import { usersTable } from '../db/schema.js';
import { env } from '../env.js';
import { csrfTokenHandler } from '../middleware/csrf.js';

const router = Router();
const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

const testLoginQuerySchema = z.object({
  email: z.string().trim().email(),
});

const authUserColumns = {
  id: usersTable.id,
  email: usersTable.email,
  name: usersTable.name,
  avatarUrl: usersTable.avatarUrl,
  role: usersTable.role,
  active: usersTable.active,
};

const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
) => {
  const response: ApiResponse<null> = {
    data: null,
    error: {
      code,
      message,
    },
  };

  res.status(status).json(response);
};

router.post('/login', async (req, res, next) => {
  const parsedBody = loginBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    sendError(res, 422, 'VALIDATION_ERROR', 'Email and password are required.');
    return;
  }

  try {
    const email = parsedBody.data.email.toLowerCase();
    const user = getLoginUserByEmail(email);

    if (
      !user ||
      !user.active ||
      user.deletedAt ||
      !user.passwordHash ||
      !(await verifyPassword(parsedBody.data.password, user.passwordHash))
    ) {
      sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      return;
    }

    req.login(toAuthenticatedUser(user), (error) => {
      if (error) {
        next(error);
        return;
      }

      res.status(200).json({
        data: { success: true, user: toAuthenticatedUser(user) },
        error: null,
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      next(error);
      return;
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        next(sessionError);
        return;
      }

      res.clearCookie('connect.sid');
      res.status(200).json({ data: { success: true }, error: null });
    });
  });
});

if (env.enableTestAuth) {
  router.get('/test-login', async (req, res, next) => {
    const parsedQuery = testLoginQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      sendError(res, 422, 'VALIDATION_ERROR', 'A valid email is required.');
      return;
    }

    const email = parsedQuery.data.email.toLowerCase();

    const user = await db
      .select(authUserColumns)
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (!user || !user.active) {
      sendError(res, 404, 'NOT_FOUND', 'User not found.');
      return;
    }

    req.login(user, (error) => {
      if (error) {
        next(error);
        return;
      }

      res.redirect('/');
    });
  });
}

router.get('/csrf', csrfTokenHandler);

router.get('/me', (req, res) => {
  if (!req.user) {
    sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    return;
  }

  res.status(200).json({
    data: req.user,
    error: null,
  });
});

export const authRouter = router;

import type { ApiResponse } from '@book-club/shared';
import { and, eq, isNull } from 'drizzle-orm';
import { Router, type Response } from 'express';
import { z } from 'zod';

import {
  buildResetPasswordUrl,
  consumeAuthToken,
  createAuthToken,
  getActiveAuthToken,
  revokeActiveAuthTokensForUser,
} from '../auth/reset-tokens.js';
import {
  getLoginUserByEmail,
  hashPassword,
  toAuthenticatedUser,
  verifyPassword,
} from '../auth/password-auth.js';
import { db } from '../db/client.js';
import { usersTable } from '../db/schema.js';
import { env } from '../env.js';
import { csrfTokenHandler } from '../middleware/csrf.js';
import {
  renderInviteEmail,
  renderPasswordResetEmail,
  sendEmail,
} from '../services/email.js';

const router = Router();
const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

const forgotPasswordBodySchema = z.object({
  email: z.string().trim().email(),
});

const resetPasswordBodySchema = z.object({
  token: z.string().trim().min(20).max(200),
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

router.post('/forgot-password', async (req, res, next) => {
  const parsedBody = forgotPasswordBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    sendError(res, 422, 'VALIDATION_ERROR', 'A valid email is required.');
    return;
  }

  try {
    const email = parsedBody.data.email.toLowerCase();
    const user = db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        active: usersTable.active,
        deletedAt: usersTable.deletedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (user && user.active && !user.deletedAt) {
      const token = createAuthToken({
        userId: user.id,
        type: 'password-reset',
      });
      const resetUrl = buildResetPasswordUrl(token.rawToken);

      await sendEmail({
        to: user.email,
        ...renderPasswordResetEmail({
          name: user.name,
          resetUrl,
          expiresAt: token.expiresAt,
        }),
      });
    }

    res.status(200).json({
      data: {
        success: true,
        message:
          'If that account exists and is active, a reset link has been sent.',
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  const parsedBody = resetPasswordBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    sendError(
      res,
      422,
      'VALIDATION_ERROR',
      'A valid reset token and password are required.',
    );
    return;
  }

  try {
    const token =
      getActiveAuthToken({
        rawToken: parsedBody.data.token,
        type: 'password-reset',
      }) ??
      getActiveAuthToken({
        rawToken: parsedBody.data.token,
        type: 'invite',
      });

    if (!token || !token.userActive || token.userDeletedAt) {
      sendError(res, 400, 'RESET_TOKEN_INVALID', 'Reset link is invalid or expired.');
      return;
    }

    const passwordHash = await hashPassword(parsedBody.data.password);
    const now = new Date().toISOString();

    db.update(usersTable)
      .set({
        passwordHash,
        passwordSetAt: now,
      })
      .where(eq(usersTable.id, token.userId))
      .run();

    consumeAuthToken(token.id);
    revokeActiveAuthTokensForUser({
      userId: token.userId,
      types: ['invite', 'password-reset'],
    });

    res.status(200).json({
      data: { success: true },
      error: null,
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

import type { ApiResponse } from '@book-club/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { passportInstance } from '../auth/passport.js';
import { db } from '../db/client.js';
import { usersTable } from '../db/schema.js';
import { env } from '../env.js';

const router = Router();

router.get('/google', (req, res, next) => {
  if (
    !env.googleClientId ||
    !env.googleClientSecret ||
    !env.googleCallbackUrl
  ) {
    const response: ApiResponse<null> = {
      data: null,
      error: {
        code: 'GOOGLE_AUTH_NOT_CONFIGURED',
        message: 'Google OAuth is not configured.',
      },
    };

    res.status(503).json(response);
    return;
  }

  passportInstance.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
});

router.get(
  '/google/callback',
  passportInstance.authenticate('google', {
    failureRedirect: `${env.clientUrl}/login?error=auth_failed`,
    session: true,
  }),
  (_req, res) => {
    res.redirect(env.clientUrl);
  },
);

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

if (env.enableTestAuth || env.nodeEnv !== 'production') {
  router.get('/test-login', async (req, res, next) => {
    const email =
      typeof req.query.email === 'string'
        ? req.query.email.trim().toLowerCase()
        : '';

    if (!email) {
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required.',
        },
      };

      res.status(422).json(response);
      return;
    }

    const user = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        role: usersTable.role,
        active: usersTable.active,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (!user || !user.active) {
      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found.',
        },
      };

      res.status(404).json(response);
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

router.get('/me', (req, res) => {
  if (!req.user) {
    const response: ApiResponse<null> = {
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
    };

    res.status(401).json(response);
    return;
  }

  res.status(200).json({
    data: req.user,
    error: null,
  });
});

export const authRouter = router;

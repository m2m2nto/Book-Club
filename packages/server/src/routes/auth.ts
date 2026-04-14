import type { ApiResponse } from '@book-club/shared';
import { eq } from 'drizzle-orm';
import { Router, type Response } from 'express';

import { passportInstance } from '../auth/passport.js';
import { db } from '../db/client.js';
import { usersTable } from '../db/schema.js';
import { env } from '../env.js';

const router = Router();

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

router.get('/google', (req, res, next) => {
  if (
    !env.googleClientId ||
    !env.googleClientSecret ||
    !env.googleCallbackUrl
  ) {
    sendError(
      res,
      503,
      'GOOGLE_AUTH_NOT_CONFIGURED',
      'Google OAuth is not configured.',
    );
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
      sendError(res, 422, 'VALIDATION_ERROR', 'Email is required.');
      return;
    }

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

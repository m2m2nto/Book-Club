/* eslint-disable @typescript-eslint/no-empty-object-type */
import 'express-session';

import type { AuthenticatedUser } from '../auth/passport.js';

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user: number;
    };
    adminDbExportConfirmation?: {
      token: string;
      expiresAt: number;
    };
    csrfToken?: string;
  }
}

export {};

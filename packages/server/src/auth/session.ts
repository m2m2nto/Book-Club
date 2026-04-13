import session from 'express-session';

import { env } from '../env.js';
import { SqliteSessionStore } from './sqlite-session-store.js';

export const sessionMiddleware = session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new SqliteSessionStore(),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 24,
  },
});

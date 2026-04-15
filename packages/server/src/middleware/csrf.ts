import crypto from 'node:crypto';

import type { RequestHandler } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-csrf-token';

const getSessionCsrfToken = (req: Parameters<RequestHandler>[0]) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomUUID();
  }

  return req.session.csrfToken;
};

export const csrfTokenHandler: RequestHandler = (req, res) => {
  res.status(200).json({
    data: {
      csrfToken: getSessionCsrfToken(req),
    },
    error: null,
  });
};

export const csrfProtection: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    getSessionCsrfToken(req);
    next();
    return;
  }

  const token = req.get(CSRF_HEADER);
  const sessionToken = req.session.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({
      data: null,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'A valid CSRF token is required for this request.',
      },
    });
    return;
  }

  next();
};

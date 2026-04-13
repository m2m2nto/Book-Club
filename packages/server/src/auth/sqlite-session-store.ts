import session from 'express-session';

import { sqlite } from '../db/client.js';

const createSessionsTable = sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )
`);

createSessionsTable.run();

const getSessionStatement = sqlite.prepare(
  'SELECT sess FROM sessions WHERE sid = ? AND expire >= ?',
);
const setSessionStatement = sqlite.prepare(
  `
    INSERT INTO sessions (sid, sess, expire)
    VALUES (?, ?, ?)
    ON CONFLICT(sid) DO UPDATE SET
      sess = excluded.sess,
      expire = excluded.expire
  `,
);
const destroySessionStatement = sqlite.prepare(
  'DELETE FROM sessions WHERE sid = ?',
);
const touchSessionStatement = sqlite.prepare(
  'UPDATE sessions SET expire = ? WHERE sid = ?',
);
const clearExpiredStatement = sqlite.prepare(
  'DELETE FROM sessions WHERE expire < ?',
);

export class SqliteSessionStore extends session.Store {
  override get(
    sid: string,
    callback: (err?: unknown, sessionData?: session.SessionData | null) => void,
  ) {
    try {
      clearExpiredStatement.run(Date.now());
      const row = getSessionStatement.get(sid, Date.now()) as
        | { sess: string }
        | undefined;

      if (!row) {
        callback(undefined, null);
        return;
      }

      callback(undefined, JSON.parse(row.sess) as session.SessionData);
    } catch (error) {
      callback(error);
    }
  }

  override set(
    sid: string,
    sessionData: session.SessionData,
    callback?: (err?: unknown) => void,
  ) {
    try {
      const expiry = sessionData.cookie.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + 24 * 60 * 60 * 1000;

      setSessionStatement.run(sid, JSON.stringify(sessionData), expiry);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  override destroy(sid: string, callback?: (err?: unknown) => void) {
    try {
      destroySessionStatement.run(sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  override touch(
    sid: string,
    sessionData: session.SessionData,
    callback?: () => void,
  ) {
    const expiry = sessionData.cookie.expires
      ? new Date(sessionData.cookie.expires).getTime()
      : Date.now() + 24 * 60 * 60 * 1000;

    touchSessionStatement.run(expiry, sid);
    callback?.();
  }
}

import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const sessionSecret =
  process.env.SESSION_SECRET ??
  (nodeEnv === 'production' ? undefined : 'development-session-secret');

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be configured in production.');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM,
  enableTestAuth:
    process.env.ENABLE_TEST_AUTH === 'true' || process.env.NODE_ENV === 'test',
};

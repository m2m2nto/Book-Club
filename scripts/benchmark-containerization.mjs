import fs from 'node:fs';

const read = (path) => (fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '');
const has = (text, pattern) => pattern.test(text);

const files = {
  dockerfile: read('Dockerfile'),
  compose: read('docker-compose.yml'),
  dockerignore: read('.dockerignore'),
  readme: read('README.md'),
  app: read('packages/server/src/app.ts'),
  session: read('packages/server/src/auth/session.ts'),
};

const checks = [
  {
    score: 20,
    ok:
      has(files.dockerfile, /FROM node:[^\n]+ AS build/i) &&
      has(files.dockerfile, /npm ci/) &&
      has(files.dockerfile, /npm run build/),
  },
  {
    score: 10,
    ok:
      has(files.dockerfile, /FROM node:[^\n]+ AS runtime/i) &&
      has(files.dockerfile, /USER node/) &&
      has(files.dockerfile, /CMD \[/),
  },
  {
    score: 20,
    ok:
      has(files.compose, /volumes:/) &&
      has(files.compose, /book-club-data:/) &&
      has(files.compose, /DATABASE_URL=\/data\/book-club\.db/),
  },
  {
    score: 10,
    ok:
      has(files.compose, /healthcheck:/) &&
      has(files.compose, /\/api\/health/),
  },
  {
    score: 10,
    ok:
      has(files.app, /express\.static/) &&
      has(files.app, /sendFile\(/),
  },
  {
    score: 10,
    ok:
      has(files.session, /secure:\s*env\.nodeEnv === 'production' \? 'auto' : false/) ||
      has(files.session, /secure:\s*'auto'/),
  },
  {
    score: 10,
    ok:
      has(files.dockerignore, /node_modules/) &&
      has(files.dockerignore, /packages\/client\/dist/) &&
      has(files.dockerignore, /packages\/server\/data/),
  },
  {
    score: 10,
    ok:
      has(files.readme, /docker compose up --build -d/) &&
      has(files.readme, /named Docker volume/i) &&
      has(files.readme, /container updates won't erase/i),
  },
  {
    score: 10,
    ok:
      has(files.compose, /read_only:\s*true/) &&
      has(files.compose, /tmpfs:/) &&
      has(files.compose, /\/tmp/),
  },
  {
    score: 10,
    ok:
      has(files.compose, /security_opt:/) &&
      has(files.compose, /no-new-privileges:true/) &&
      has(files.compose, /cap_drop:/) &&
      has(files.compose, /- ALL/),
  },
  {
    score: 10,
    ok: has(files.compose, /init:\s*true/),
  },
  {
    score: 10,
    ok:
      has(files.dockerignore, /e2e/) &&
      has(files.dockerignore, /tasks/) &&
      has(files.dockerignore, /SPEC\.md/) &&
      has(files.dockerignore, /UX_UI_SPEC\.md/) &&
      has(files.dockerignore, /LAUNCH\.md/) &&
      has(files.dockerignore, /scripts/),
  },
];

const score = checks.reduce((sum, check) => sum + (check.ok ? check.score : 0), 0);
console.log(`METRIC container_score=${score}`);

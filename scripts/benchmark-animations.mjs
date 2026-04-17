import fs from 'node:fs';

const read = (path) => (fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '');
const has = (text, pattern) => pattern.test(text);

const files = {
  main: read('packages/client/src/main.tsx'),
  protectedLayout: read('packages/client/src/components/protected-layout.tsx'),
  pageTransition: read('packages/client/src/components/page-transition.tsx'),
  appShell: read('packages/client/src/components/app-shell.tsx'),
  toast: read('packages/client/src/components/ui/toast-provider.tsx'),
  css: read('packages/client/src/index.css'),
  dashboard: read('packages/client/src/pages/dashboard-page.tsx'),
  home: read('packages/client/src/pages/home-page.tsx'),
  login: read('packages/client/src/pages/login-page.tsx'),
  books: read('packages/client/src/pages/books-page.tsx'),
  meetings: read('packages/client/src/pages/meetings-page.tsx'),
  surveys: read('packages/client/src/pages/surveys-page.tsx'),
  wishlist: read('packages/client/src/pages/wishlist-page.tsx'),
};

const checks = [
  {
    score: 20,
    ok:
      has(files.pageTransition, /useLocation/) &&
      has(files.protectedLayout, /PageTransition/) &&
      has(files.protectedLayout, /<PageTransition>/),
  },
  {
    score: 15,
    ok:
      has(files.main, /import \{ PageTransition \}/) &&
      has(files.main, /path="\/login"[\s\S]*<PageTransition>/) &&
      has(files.main, /path="\/reset-password"[\s\S]*<PageTransition>/) &&
      has(files.main, /path="\*"[\s\S]*<PageTransition>/),
  },
  {
    score: 15,
    ok:
      has(files.css, /\.page-transition/) &&
      has(files.css, /@keyframes page-enter/) &&
      has(files.css, /prefers-reduced-motion/),
  },
  {
    score: 10,
    ok:
      has(files.toast, /toast-enter/) &&
      has(files.css, /@keyframes toast-enter/),
  },
  {
    score: 10,
    ok:
      has(files.appShell, /menu-panel/) && has(files.css, /\.menu-panel/),
  },
  {
    score: 10,
    ok:
      has(files.css, /\.stagger-group > \.stagger-item/) &&
      has(files.css, /animation-delay: calc\(var\(--stagger-index\) \* 20ms\)/),
  },
  {
    score: 10,
    ok:
      has(files.dashboard, /stagger-group/) &&
      has(files.dashboard, /--stagger-index/),
  },
  {
    score: 10,
    ok: has(files.home, /stagger-group/) && has(files.home, /--stagger-index/),
  },
  {
    score: 10,
    ok:
      has(files.login, /stagger-group/) && has(files.login, /--stagger-index/),
  },
  {
    score: 10,
    ok:
      [files.books, files.meetings, files.surveys, files.wishlist].filter(
        (text) => /stagger-group/.test(text) && /--stagger-index/.test(text),
      ).length >= 2,
  },
];

const score = checks.reduce((sum, check) => sum + (check.ok ? check.score : 0), 0);
console.log(`METRIC animation_score=${score}`);

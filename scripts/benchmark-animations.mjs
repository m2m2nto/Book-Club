import fs from 'node:fs';

const read = (path) => (fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '');
const has = (text, pattern) => pattern.test(text);

const files = {
  protectedLayout: read('packages/client/src/components/protected-layout.tsx'),
  pageTransition: read('packages/client/src/components/page-transition.tsx'),
  appShell: read('packages/client/src/components/app-shell.tsx'),
  toast: read('packages/client/src/components/ui/toast-provider.tsx'),
  css: read('packages/client/src/index.css'),
  dashboard: read('packages/client/src/pages/dashboard-page.tsx'),
};

const checks = [
  {
    score: 20,
    ok:
      has(files.pageTransition, /useLocation/) &&
      has(files.pageTransition, /className="page-transition"/),
  },
  {
    score: 20,
    ok:
      has(files.protectedLayout, /PageTransition/) &&
      has(files.protectedLayout, /<PageTransition>/),
  },
  {
    score: 20,
    ok:
      has(files.css, /\.page-transition/) &&
      has(files.css, /@keyframes page-enter/) &&
      has(files.css, /prefers-reduced-motion/),
  },
  {
    score: 15,
    ok:
      has(files.toast, /toast-enter/) &&
      has(files.css, /@keyframes toast-enter/),
  },
  {
    score: 15,
    ok:
      has(files.appShell, /menu-panel/) &&
      has(files.appShell, /max-h-\[72rem\]/) &&
      has(files.css, /\.menu-panel/),
  },
  {
    score: 10,
    ok:
      has(files.css, /\.stagger-group > \.stagger-item/) &&
      has(files.dashboard, /stagger-item/) &&
      has(files.dashboard, /--stagger-index/),
  },
];

const score = checks.reduce((sum, check) => sum + (check.ok ? check.score : 0), 0);
console.log(`METRIC animation_score=${score}`);

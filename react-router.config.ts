import type { Config } from '@react-router/dev/config';

export default {
  // Config options...
  // Disabled for static SPA export (GitHub Pages)
  ssr: false,
  basename: process.env.NODE_ENV === 'production' ? '/melloclean.com' : '/',
  appDirectory: 'frontend',
} satisfies Config;

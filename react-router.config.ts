import type { Config } from '@react-router/dev/config';

export default {
  // Config options...
  // Disabled for static SPA export (GitHub Pages)
  ssr: false,
  appDirectory: 'frontend',
} satisfies Config;

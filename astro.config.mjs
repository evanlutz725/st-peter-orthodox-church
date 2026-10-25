import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.URL || 'https://st-peter-orthodox-fort-myers.netlify.app',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
});

import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      '@openmfp/portal-ui-lib': resolve(__dirname, 'projects/lib/src/public-api.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        url: 'https://example.com',
      },
    },
    setupFiles: ['./projects/test-setup.ts'],
  },
});

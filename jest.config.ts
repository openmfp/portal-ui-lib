import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets';

const esmPreset = presets.createEsmPreset();

export default {
  ...esmPreset,
  moduleNameMapper: {
    ...esmPreset.moduleNameMapper,
    '^rxjs': '<rootDir>/node_modules/rxjs/dist/bundles/rxjs.umd.js',
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  setupFiles: ['construct-style-sheets-polyfill', 'element-internals-polyfill'],
} satisfies Config;

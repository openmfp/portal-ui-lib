import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets';

const esmPreset = presets.createEsmPreset();

export default {
  ...esmPreset,
  moduleNameMapper: {
    ...esmPreset.moduleNameMapper,
    '^rxjs': '<rootDir>/node_modules/rxjs/dist/bundles/rxjs.umd.js',
    '^rxjs/operators': '<rootDir>/node_modules/rxjs/dist/bundles/rxjs.umd.js',
    '^lodash-es$': 'lodash',
    '^lodash-es/(.*)$': 'lodash/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  setupFiles: ['construct-style-sheets-polyfill', 'element-internals-polyfill'],
  // transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  transformIgnorePatterns: ['node_modules/(?!tslib)/'],
  testMatch: ['**/*.spec.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
} satisfies Config;

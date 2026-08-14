import angular from '@openmfp/eslint-config-typescript/angular.js';

export default [
  {
    ignores: ['dist/**', 'dist-wc/**', 'coverage/**'],
  },
  ...angular,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Enable type-aware linting rules from the shared config.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow explicit `any` — used pervasively for third-party Luigi/DOM
      // callback signatures and dynamic config maps.
      '@typescript-eslint/no-explicit-any': 'off',
      // Preserve the library's historical selector prefixes (was `.eslintrc.json`).
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'lib',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'lib',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // The shared config applies eslint-plugin-jest to *.spec.ts; this project
    // uses vitest (jest-compatible API), so pin the version the plugin checks.
    files: ['**/*.spec.ts'],
    settings: {
      jest: {
        version: 29,
      },
    },
  },
];

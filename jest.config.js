module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '@openmfp/portal-ui-lib': '<rootDir>/projects/lib/src/public-api.ts',
  },
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/jest-global-mocks.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: -28,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/integration-tests/'],
};

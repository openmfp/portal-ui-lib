module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
  },
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/jest-global-mocks.ts'],
  // coverageThreshold: {
  //   global: {
  //     // branches: 80,
  //     // functions: 90,
  //     // lines: 95,
  //     // statements: -41,
  //   },
  // },
  coveragePathIgnorePatterns: ['/node_modules/', '/integration-tests/'],
};

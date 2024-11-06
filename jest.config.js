module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/integration-tests/'],
};

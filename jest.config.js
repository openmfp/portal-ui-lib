module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
  },
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/integration-tests/'],
};

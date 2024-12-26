module.exports = {
  preset: 'jest-preset-angular',
  testRunner: 'jest-jasmine2',
  collectCoverage: true,
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/dist-wc/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/integration-tests/'],
};

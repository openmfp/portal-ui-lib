const path = require('path');

module.exports = {
  displayName: 'wc',
  coverageDirectory: path.resolve(__dirname, '../../coverage/wc'),
  coveragePathIgnorePatterns: ['<rootDir>/projects/lib/src/'],
  setupFilesAfterEnv: [`${__dirname}/jest.setup.ts`],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 80,
      lines: 94,
      statements: -8,
    },
  },
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '@openmfp/portal-ui-lib': path.resolve(
      __dirname,
      '../lib/src/public-api.ts',
    ),
  },
};

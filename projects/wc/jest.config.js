const path = require('path');

module.exports = {
  displayName: 'wc',
  coverageDirectory: path.resolve(__dirname, '../../coverage/wc'),
  coveragePathIgnorePatterns: ['<rootDir>/projects/lib/src/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: -1,
    },
  },
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '@openmfp/portal-ui-lib': path.resolve(
      __dirname,
      '../lib/src/public-api.ts'
    ),
  },
};

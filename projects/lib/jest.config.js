const path = require('path');

module.exports = {
  displayName: 'lib',
  coverageDirectory: path.resolve(__dirname, '../../coverage/lib'),
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: -29,
    },
  },
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
  },
};

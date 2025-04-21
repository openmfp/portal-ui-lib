// import defaultConfig from '../../jest.config';
import { Config } from '@jest/types';
import path from 'path';

const config: Config.InitialOptions = {
  // ...defaultConfig,
  displayName: 'wc',
  coverageDirectory: path.resolve(__dirname, '../../coverage/wc'),
  coveragePathIgnorePatterns: ['<rootDir>/projects/lib/src/'],
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

export default config;

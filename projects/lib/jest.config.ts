import defaultConfig from '../../jest.config';
import { Config } from '@jest/types';
import path from 'path';

const config: Config.InitialOptions = {
  ...defaultConfig,
  displayName: 'lib',
  coverageDirectory: path.resolve(__dirname, '../../coverage/lib'),
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: -19,
    },
  },
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
  },
};

export default config;

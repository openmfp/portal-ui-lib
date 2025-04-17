import { jest } from '@jest/globals';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';

// @ts-ignore
global.spyOn = jest.spyOn;
setupZoneTestEnv();

global.jest = jest;

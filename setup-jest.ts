import { jest } from '@jest/globals';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';
import resizeObserver from 'resize-observer-polyfill';

setupZoneTestEnv();
// @ts-ignore
global.spyOn = jest.spyOn;
global.ResizeObserver = resizeObserver;
global.jest = jest;

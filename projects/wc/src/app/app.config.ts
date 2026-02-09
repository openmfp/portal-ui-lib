import { provideLuigiWebComponents } from './initializers/luigi-wc-initializer';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';

document.body.classList.add('ui5-content-density-compact');

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideLuigiWebComponents(),
    provideZonelessChangeDetection(),
  ],
};

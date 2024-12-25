import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideLuigiWebComponents } from './initializers/luigi-wc-initializer';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideLuigiWebComponents()],
};

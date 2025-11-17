import { provideLuigiWebComponents } from './initializers/luigi-wc-initializer';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import '@ui5/webcomponents-fiori/illustrations/NoData.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/download-from-cloud.js';

document.body.classList.add('ui5-content-density-compact');

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideLuigiWebComponents()],
};

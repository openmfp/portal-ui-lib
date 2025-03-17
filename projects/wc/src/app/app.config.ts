import { provideLuigiWebComponents } from './initializers/luigi-wc-initializer';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import '@ui5/webcomponents-fiori/DynamicPage.js';
import '@ui5/webcomponents-fiori/IllustratedMessage.js';
import '@ui5/webcomponents-fiori/illustrations/NoData.js';
import '@ui5/webcomponents/Table.js';
import '@ui5/webcomponents/dist/TableHeaderCell.js';
import '@ui5/webcomponents/dist/TableHeaderRow.js';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideLuigiWebComponents()],
};

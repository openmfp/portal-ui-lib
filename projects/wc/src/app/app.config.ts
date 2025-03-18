import { provideLuigiWebComponents } from './initializers/luigi-wc-initializer';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import '@ui5/webcomponents-fiori/DynamicPage.js';
import '@ui5/webcomponents-fiori/IllustratedMessage.js';
import '@ui5/webcomponents-fiori/illustrations/NoData.js';
// todo gkr clean up the imports
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents/Table.js';
import '@ui5/webcomponents/dist/Button.js';
import '@ui5/webcomponents/dist/Dialog.js';
import '@ui5/webcomponents/dist/Icon.js';
import '@ui5/webcomponents/dist/Input.js';
import '@ui5/webcomponents/dist/Label.js';
import '@ui5/webcomponents/dist/Link.js';
import '@ui5/webcomponents/dist/TableHeaderCell.js';
import '@ui5/webcomponents/dist/TableHeaderRow.js';
import '@ui5/webcomponents/dist/Toolbar.js';
import '@ui5/webcomponents/dist/ToolbarButton.js';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideLuigiWebComponents()],
};

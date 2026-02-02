import { Component } from '@angular/core';

@Component({ selector: 'ui5-component', template: '', standalone: true })
export class MockComponent {}

jest.mock('@fundamental-ngx/ui5-webcomponents', () => {
  return {
    Button: MockComponent,
    Input: MockComponent,
    Label: MockComponent,
    List: MockComponent,
    ListItemCustom: MockComponent,
    Switch: MockComponent,
    Link: MockComponent,
  };
});

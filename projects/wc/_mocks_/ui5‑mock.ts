import { Component } from '@angular/core';

@Component({ selector: 'ui5-component', template: '', standalone: true })
export class MockComponent {}

jest.mock('@ui5/webcomponents-ngx', () => {
  return {
    DialogComponent: MockComponent,
    OptionComponent: MockComponent,
    SelectComponent: MockComponent,
    InputComponent: MockComponent,
    LabelComponent: MockComponent,
    ToolbarButtonComponent: MockComponent,
    ToolbarComponent: MockComponent,
    DynamicPageComponent: MockComponent,
    DynamicPageTitleComponent: MockComponent,
    DynamicPageHeaderComponent: MockComponent,
    BreadcrumbsComponent: MockComponent,
    BreadcrumbsItemComponent: MockComponent,
    IconComponent: MockComponent,
    IllustratedMessageComponent: MockComponent,
    TableComponent: MockComponent,
    TableCellComponent: MockComponent,
    TableHeaderCellComponent: MockComponent,
    TableHeaderRowComponent: MockComponent,
    TableRowComponent: MockComponent,
    TextComponent: MockComponent,
    TitleComponent: MockComponent,
  };
});

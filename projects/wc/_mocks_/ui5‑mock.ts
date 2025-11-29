import { Component } from '@angular/core';


@Component({ selector: 'ui5-component', template: '', standalone: true })
export class MockComponent {}

jest.mock('@ui5/webcomponents-ngx', () => {
  return {
    BreadcrumbsComponent: MockComponent,
    BreadcrumbsItemComponent: MockComponent,
    ButtonComponent: MockComponent,
    DialogComponent: MockComponent,
    DynamicPageComponent: MockComponent,
    DynamicPageHeaderComponent: MockComponent,
    DynamicPageTitleComponent: MockComponent,
    IconComponent: MockComponent,
    IllustratedMessageComponent: MockComponent,
    InputComponent: MockComponent,
    LabelComponent: MockComponent,
    OptionComponent: MockComponent,
    SelectComponent: MockComponent,
    TableCellComponent: MockComponent,
    TableComponent: MockComponent,
    TableHeaderCellComponent: MockComponent,
    TableHeaderRowComponent: MockComponent,
    TableRowComponent: MockComponent,
    TextComponent: MockComponent,
    TitleComponent: MockComponent,
    ToolbarButtonComponent: MockComponent,
    ToolbarComponent: MockComponent,
    SwitchComponent: MockComponent,
    ListComponent: MockComponent,
    ListItemCustomComponent: MockComponent,
    LinkComponent: MockComponent,
  };
});

jest.mock('@ui5/webcomponents-fiori/dist/illustrations/NoEntries', () => ({}));

jest.mock(
  '@ui5/webcomponents-fiori/dist/illustrations/NoSearchResults',
  () => ({}),
);

jest.mock(
  '@ui5/webcomponents-fiori/dist/illustrations/tnt/UnsuccessfulAuth',
  () => ({}),
);

jest.mock(
  '@ui5/webcomponents-fiori/dist/illustrations/UnableToLoad',
  () => ({}),
);
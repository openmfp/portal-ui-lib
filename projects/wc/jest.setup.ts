jest.mock('@ui5/webcomponents-ngx', () => {
  const stubs = jest.requireActual('./_mocks_/ui5‑stubs');
  return {
    DialogComponent: stubs.MockDialogComponent,
    OptionComponent: stubs.MockOptionComponent,
    SelectComponent: stubs.MockSelectComponent,
    InputComponent: stubs.MockInputComponent,
    LabelComponent: stubs.MockLabelComponent,
    ToolbarButtonComponent: stubs.MockToolbarButtonComponent,
    ToolbarComponent: stubs.MockToolbarComponent,
    DynamicPageComponent: stubs.MockDynamicPageComponent,
    DynamicPageTitleComponent: stubs.MockDynamicPageTitleComponent,
    DynamicPageHeaderComponent: stubs.MockDynamicPageHeaderComponent,
    BreadcrumbsComponent: stubs.MockBreadcrumbsComponent,
    BreadcrumbsItemComponent: stubs.MockBreadcrumbsItemComponent,
    IconComponent: stubs.MockIconComponent,
    IllustratedMessageComponent: stubs.MockIllustratedMessageComponent,
    TableComponent: stubs.MockTableComponent,
    TableCellComponent: stubs.MockTableCellComponent,
    TableHeaderCellComponent: stubs.MockTableHeaderCellComponent,
    TableHeaderRowComponent: stubs.MockTableHeaderRowComponent,
    TableRowComponent: stubs.MockTableRowComponent,
    TextComponent: stubs.MockTextComponent,
    TitleComponent: stubs.MockTitleComponent,
  };
});

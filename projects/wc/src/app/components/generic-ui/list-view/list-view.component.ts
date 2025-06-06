import { CreateResourceModalComponent } from './create-resource-modal/create-resource-modal.component';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  FieldDefinition,
  LuigiCoreService,
  NodeContext,
  Resource,
  ResourceDefinition,
  ResourceService,
  generateGraphQLFields,
  getResourceValueByJsonPath,
} from '@openmfp/portal-ui-lib';
import {
  DynamicPageComponent,
  DynamicPageTitleComponent,
  IconComponent,
  IllustratedMessageComponent,
  TableCellComponent,
  TableComponent,
  TableHeaderCellComponent,
  TableHeaderRowComponent,
  TableRowComponent,
  TextComponent,
  TitleComponent,
  ToolbarButtonComponent,
  ToolbarComponent,
} from '@ui5/webcomponents-ngx';

const defaultColumns: FieldDefinition[] = [
  {
    label: 'Name',
    property: 'metadata.name',
  },
  {
    label: 'Workspace Status',
    jsonPathExpression: 'status.conditions[?(@.type=="Ready")].status',
    property: ['status.conditions.status', 'status.conditions.type'],
  },
];

@Component({
  selector: 'list-view',
  standalone: true,
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CreateResourceModalComponent,
    DynamicPageComponent,
    DynamicPageTitleComponent,
    IconComponent,
    IllustratedMessageComponent,
    TableComponent,
    TableCellComponent,
    TableHeaderCellComponent,
    TableHeaderRowComponent,
    TableRowComponent,
    TextComponent,
    TitleComponent,
    ToolbarButtonComponent,
    ToolbarComponent,
  ],
})
export class ListViewComponent implements OnInit {
  private resourceService = inject(ResourceService);
  private luigiCoreService = inject(LuigiCoreService);
  private destroyRef = inject(DestroyRef);
  LuigiClient = input<LuigiClient>();
  context = input<NodeContext>();
  private createModal = viewChild<CreateResourceModalComponent>('createModal');

  resources = signal<Resource[]>([]);
  columns: FieldDefinition[];
  heading: string;
  resourceDefinition: ResourceDefinition;
  protected readonly getResourceValueByJsonPath = getResourceValueByJsonPath;

  constructor() {
    effect(() => {
      this.resourceDefinition = this.context().resourceDefinition;
      this.columns =
        this.context().resourceDefinition.ui?.listView?.fields ||
        defaultColumns;
      this.heading = `${this.context().resourceDefinition.plural.charAt(0).toUpperCase()}${this.context().resourceDefinition.plural.slice(1)}`;

      this.read();
    });
  }

  ngOnInit(): void {}

  read() {
    const fields = generateGraphQLFields(this.columns);
    const queryOperation = `${this.resourceDefinition.group.replaceAll('.', '_')}_${this.resourceDefinition.plural}`;

    this.resourceService
      .list(queryOperation, fields, this.context())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.resources.set(result);
        },
      });
  }

  delete(event: any, resource: Resource) {
    event.stopPropagation();

    this.resourceService
      .delete(resource, this.resourceDefinition, this.context())
      .subscribe({
        next: (result) => {
          console.debug('Resource deleted.');
        },
        error: (error) => {
          this.luigiCoreService.showAlert({
            text: `Failure! Could not delete resource: ${resource.metadata.name}.`,
            type: 'error',
          });
        },
      });
  }

  create(resource: Resource) {
    this.resourceService
      .create(resource, this.resourceDefinition, this.context())
      .subscribe({
        next: (result) => {
          console.debug('Resource created', result.data);
        },
        error: (error) => {
          this.luigiCoreService.showAlert({
            text: `Failure! Could not create resource: ${resource.metadata.name}.`,
            type: 'error',
          });
        },
      });
  }

  navigateToResource(resource: Resource) {
    this.LuigiClient().linkManager().navigate(resource.metadata.name);
  }

  openCreateResourceModal() {
    this.createModal()?.open();
  }

  hasUiCreateViewFields() {
    return !!this.resourceDefinition?.ui?.createView?.fields?.length;
  }
}

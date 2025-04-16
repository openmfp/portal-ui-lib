import {
  FieldDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../models/resource';
import { ResourceService } from '../services/resource.service';
import { generateGraphQLFields } from '../utils/columns-to-gql-fields';
import { getResourceValueByJsonPath } from '../utils/resource-field-by-path';
import { CreateResourceModalComponent } from './create-resource-modal/create-resource-modal.component';
import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';
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
  styleUrls: ['./list-view.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
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

  private createModal = viewChild<CreateResourceModalComponent>('createModal');
  protected readonly getResourceValueByJsonPath = getResourceValueByJsonPath;

  columns: FieldDefinition[];
  resources: Resource[] = [
    {
      __typename: 'Account',
      metadata: {
        name: 'mcp-demo',
      },
      spec: {
        __typename: 'Accountspec',
        displayName: 'MCP Demo',
        type: 'account',
      },
    },
    {
      __typename: 'Account',
      metadata: {
        name: 'openmfp',
      },
      spec: {
        __typename: 'Accountspec',
        displayName: 'OpenMFP',
        type: 'account',
      },
    },
    {
      __typename: 'Account',
      metadata: {
        name: 'vasu',
      },
      spec: {
        __typename: 'Accountspec',
        displayName: 'vasu',
        type: 'account',
      },
    },
  ];
  heading: string;
  resourceDefinition: ResourceDefinition;

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.resourceDefinition = context.resourceDefinition;
    this.columns =
      context.resourceDefinition.ui?.listView?.fields || defaultColumns;
    this.heading = `${context.resourceDefinition.plural.charAt(0).toUpperCase()}${context.resourceDefinition.plural.slice(1)}`;
  }

  ngOnInit(): void {
    this.read();
  }

  read() {
    const fields = generateGraphQLFields(this.columns);
    const queryOperation = `${this.resourceDefinition.group.replaceAll('.', '_')}_${this.resourceDefinition.plural}`;

    // this.resourceService.list(queryOperation, fields).subscribe({
    //   next: (result) => {
    //     this.resources = result;
    //   },
    // });
  }

  delete(event: any, resource: Resource) {
    event.stopPropagation();

    this.resourceService.delete(resource, this.resourceDefinition).subscribe({
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
    this.resourceService.create(resource, this.resourceDefinition).subscribe({
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
    this.LuigiClient.linkManager().navigate(resource.metadata.name);
  }

  openCreateResourceModal() {
    this.createModal()?.open();
  }

  hasUiCreateViewFields() {
    return !!this.resourceDefinition?.ui?.createView?.fields?.length;
  }
}

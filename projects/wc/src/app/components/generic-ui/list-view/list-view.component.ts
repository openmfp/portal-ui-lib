import {
  ColumnDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../models/resource';
import { ResourceService } from '../services/resource.service';
import { generateFields } from '../utils/columns-to-gql-fields';
import { CreateResourceModalComponent } from './create-resource-modal/create-resource-modal.component';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';
import jsonpath from 'jsonpath';

const defaultColumns: ColumnDefinition[] = [
  {
    property: 'metadata.name',
    label: 'Name',
  },
  {
    property: 'status.conditions[?(@.type=="Ready")].status',
    label: 'Ready',
  },
];

@Component({
  selector: 'list-view',
  standalone: true,
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CreateResourceModalComponent],
})
export class ListViewComponent implements OnInit {
  private resourceService = inject(ResourceService);
  private luigiCoreService = inject(LuigiCoreService);

  private resourceCreateModal = viewChild(CreateResourceModalComponent);

  columns: ColumnDefinition[];
  resources: Resource[];
  heading: string;
  resourceDefinition: ResourceDefinition;

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.resourceDefinition = context.resourceDefinition;
    this.columns =
      context.resourceDefinition.ui?.listView?.columns || defaultColumns;
    this.heading = `${context.resourceDefinition.plural.charAt(0).toUpperCase()}${context.resourceDefinition.plural.slice(1)}`;
  }

  ngOnInit(): void {
    document
      .getElementsByClassName('wcContainer')[0]
      .classList.add('ui5-content-density-compact');
    this.read();
  }

  read() {
    const fields = generateFields(this.columns);
    const queryOperation = `${this.resourceDefinition.group.replaceAll('.', '_')}_${this.resourceDefinition.plural}`;

    this.resourceService.read(queryOperation, fields).subscribe({
      next: (result) => {
        this.resources = result.data?.[queryOperation];
      },
      error: (error) => {
        console.error('Error executing GraphQL query', error);
      },
    });
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

  getNestedValue(resource: Resource, columnDefinition: ColumnDefinition) {
    const value = jsonpath.query(resource, `$.${columnDefinition.property}`);
    return value.length ? value[0] : undefined;
  }

  openCreateResourceModal() {
    this.resourceCreateModal().open();
  }

  hasUiCreateViewFields() {
    return !!this.resourceDefinition?.ui?.createView?.fields?.length;
  }
}

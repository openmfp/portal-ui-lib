import { generateFields } from '../../../utils/columns-to-gql-fields';
import {
  ColumnDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../models/resource';
import { ResourceService } from '../services/resource.service';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
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
  imports: [],
})
export class ListViewComponent implements OnInit {
  private resourceService = inject(ResourceService);
  private luigiCoreService = inject(LuigiCoreService);

  columns: ColumnDefinition[];
  resources: Resource[];
  heading: string;
  resourceDefinition: ResourceDefinition;

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.resourceDefinition = context.resourceDefinition;
    this.columns = context.resourceDefinition.ui?.columns || defaultColumns;
    this.heading = `${context.resourceDefinition.plural.charAt(0).toUpperCase()}${context.resourceDefinition.plural.slice(1)}`;
  }

  ngOnInit(): void {
    document
      .getElementsByClassName('wcContainer')[0]
      .classList.add('ui5-content-density-compact');
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
        console.debug('Resource deleted', result);
      },
      error: (error) => {
        this.luigiCoreService.showAlert({
          text: `Failure! Could not delete resource: ${resource.metadata.name}`,
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
}

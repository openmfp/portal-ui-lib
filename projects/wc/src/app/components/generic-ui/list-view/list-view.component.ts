import { generateFields } from '../../../utils/columns-to-gql-fields';
import {
  ColumnDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
  UIDefinition,
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

// todo gkr check with ui5 guys
document
  .getElementsByClassName('wcContainer')[0]
  .classList.add('ui5-content-density-compact');

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
  operation: string;
  nodeContext: NodeContext;

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.nodeContext = context;
    this.operation = `${context.group.replaceAll('.', '_')}_${context.plural}`;
    this.columns = context.ui?.columns || defaultColumns;
    this.heading = `${context.plural.charAt(0).toUpperCase()}${context.plural.slice(1)}`;
  }

  ngOnInit(): void {
    const fields = generateFields(this.columns);

    this.resourceService.read(this.operation, fields).subscribe({
      next: (result) => {
        this.resources = result.data?.[this.operation];
      },
      error: (error) => {
        console.error('Error executing GraphQL query', error);
      },
    });
  }

  delete(event: any, resource: Resource) {
    event.stopPropagation();

    this.resourceService
      .delete(resource, this.nodeContext.resourceDefinition)
      .subscribe({
        next: (result) => {
          this.resources = this.resources.filter(
            (e) => e.metadata.name !== resource.metadata.name,
          );
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

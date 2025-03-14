import { ApolloFactory } from '../../../services/apollo-factory';
import { generateFields } from '../../../utils/columns-to-gql-fields';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { LinkComponent } from '@fundamental-ngx/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { Apollo, gql } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import * as gqlBuilder from 'gql-query-builder';
import jsonpath from 'jsonpath';

interface ColumnDefinition {
  property: string;
  label: string;
}

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
  selector: 'wc-list-view',
  standalone: true,
  templateUrl: './list-view.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [HttpLink],
  imports: [LinkComponent],
})
export class ListViewComponent implements OnInit {
  private apolloFactory = inject(ApolloFactory);
  private apollo: Apollo = this.apolloFactory.apollo;

  columns: ColumnDefinition[];
  heading: string;
  items: any[];
  group: string;
  plural: string;
  operation: string;

  @Input()
  set context(context: Record<string, any>) {
    this.group = context.group;
    this.plural = context.plural;
    this.operation = `${context.group.replaceAll('.', '_')}_${context.plural}`;
    this.columns = context.genericUI?.columns || defaultColumns;
    this.heading = `${context.plural.charAt(0).toUpperCase()}${context.plural.slice(1)}`;
  }

  @Input()
  LuigiClient: LuigiClient;

  ngOnInit(): void {
    const fields = generateFields(this.columns);
    const query = gqlBuilder.subscription({
      operation: this.operation,
      fields,
      variables: {},
    });

    this.apollo
      .subscribe<any>({
        query: gql`
          ${query.query}
        `,
      })
      .subscribe({
        next: (result) => {
          this.items = result.data?.[this.operation];
        },
        error: (error) => {
          console.error('Error executing GraphQL query', error);
        },
      });
  }

  navigateToAccount($event: MouseEvent, item: any) {
    this.LuigiClient.linkManager().navigate(item.metadata.name);
  }

  getNestedValue(item: any, key: string) {
    const value = jsonpath.query(item, `$.${key}`);
    return value.length ? value[0] : undefined;
  }
}

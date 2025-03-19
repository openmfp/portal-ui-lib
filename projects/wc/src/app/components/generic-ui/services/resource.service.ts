import { ApolloFactory } from '../../../services/apollo-factory';
import { Resource, ResourceDefinition } from '../models/resource';
import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import * as gqlBuilder from 'gql-query-builder';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private apolloFactory = inject(ApolloFactory);
  private apollo: Apollo = this.apolloFactory.apollo;

  read(operation: string, fields: any[]) {
    const query = gqlBuilder.subscription({
      operation: operation,
      fields,
      variables: {},
    });

    return this.apollo.subscribe<any>({
      query: gql`
        ${query.query}
      `,
    });
  }

  delete(resource: Resource, resourceDefinition: ResourceDefinition) {
    return this.apollo.mutate<void>({
      mutation: gql`
        ${this.createDeleteQueryMutation(resourceDefinition)}
      `,
      variables: {
        name: resource.metadata.name,
        namespace: resourceDefinition.namespace,
      },
    });
  }

  private createDeleteQueryMutation(resourceDefinition: ResourceDefinition) {
    const group = resourceDefinition.group.replaceAll('.', '_');
    if (resourceDefinition.scope === 'Cluster') {
      return `
        mutation ($name: String!) {
          ${group} {
            delete${resourceDefinition.kind}(name: $name)
          }
      }
    `;
    }
    return `
      mutation ($name: String!, $namespace: String) {
        ${group}  {
          delete${resourceDefinition.kind}(name: $name, namespace: $namespace)
        }
      }
    `;
  }
}

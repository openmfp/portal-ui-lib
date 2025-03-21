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
    const group = resourceDefinition.group.replaceAll('.', '_');
    const kind = resourceDefinition.kind;

    const mutation = gqlBuilder.mutation({
      operation: group,
      fields: [
        {
          operation: `delete${kind}`,
          variables: {
            name: { type: 'String!' },
            ...(resourceDefinition.scope !== 'Cluster' && {
              namespace: { type: 'String!' },
            }),
          },
          fields: [],
        },
      ],
    });

    return this.apollo.mutate<void>({
      mutation: gql`
        ${mutation.query}
      `,
      variables: {
        name: resource.metadata.name,
        namespace: resourceDefinition.namespace,
      },
    });
  }

  create(resource: Resource, resourceDefinition: ResourceDefinition) {
    const group = resourceDefinition.group.replaceAll('.', '_');
    const kind = resourceDefinition.kind;
    const mutation = gqlBuilder.mutation({
      operation: group,
      fields: [
        {
          operation: `create${kind}`,
          variables: { object: { type: `${kind}Input!` } },
          fields: ['__typename'],
        },
      ],
    });

    resource.spec.type = 'account';
    return this.apollo.mutate<void>({
      mutation: gql`
        ${mutation.query}
      `,
      fetchPolicy: 'no-cache',
      variables: { object: resource },
    });
  }
}

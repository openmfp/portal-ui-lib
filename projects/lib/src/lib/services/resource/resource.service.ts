import { NodeContext, Resource, ResourceDefinition } from '../../models';
import { ApolloFactory } from './apollo-factory';
import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import * as gqlBuilder from 'gql-query-builder';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private apolloFactory = inject(ApolloFactory);

  read(
    resourceId: string,
    operation: string,
    kind: string,
    fieldsOrRawQuery: any[] | string,
    nodeContext: NodeContext,
  ): Observable<Resource> {
    let query: string;

    if (fieldsOrRawQuery instanceof Array) {
      query =
        gqlBuilder
          .query({
            operation: kind,
            variables: { name: { value: resourceId, type: 'String!' } },
            fields: fieldsOrRawQuery,
          })
          .query.replace(kind, `${operation} { ${kind}`)
          .trim() + '}';
    } else {
      query = fieldsOrRawQuery;
    }

    return this.apolloFactory
      .apollo(nodeContext, true)
      .query({
        query: gql`
          ${query}
        `,
        variables: {
          name: resourceId,
        },
      })
      .pipe(
        map((res: any) => res.data?.[operation]?.[kind]),
        catchError((error) => {
          console.error('Error executing GraphQL query', error);
          return error;
        }),
      );
  }

  list(
    operation: string,
    fields: any[],
    nodeContext: NodeContext,
  ): Observable<Resource[]> {
    const query = gqlBuilder.subscription({
      operation: operation,
      fields,
      variables: {},
    });

    return this.apolloFactory
      .apollo(nodeContext)
      .subscribe({
        query: gql`
          ${query.query}
        `,
      })
      .pipe(
        map((res: any) => res.data?.[operation]),
        catchError((error) => {
          console.error('Error executing GraphQL query: ', error);
          return error;
        }),
      );
  }

  readOrganizations(
    operation: string,
    fields: any[],
    nodeContext: NodeContext,
  ): Observable<any[]> {
    const query = gqlBuilder.query({
      operation: operation,
      fields,
      variables: {},
    });

    return this.apolloFactory
      .apollo(nodeContext)
      .query({
        query: gql`
          ${query.query}
        `,
      })
      .pipe(
        map((res: any) => res.data?.[operation]),
        catchError((error) => {
          console.error('Error executing GraphQL query', error);
          return error;
        }),
      );
  }

  delete(
    resource: Resource,
    resourceDefinition: ResourceDefinition,
    nodeContext: NodeContext,
  ) {
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

    return this.apolloFactory.apollo(nodeContext).mutate<void>({
      mutation: gql`
        ${mutation.query}
      `,
      variables: {
        name: resource.metadata.name,
        namespace: resourceDefinition.namespace,
      },
    });
  }

  create(
    resource: Resource,
    resourceDefinition: ResourceDefinition,
    nodeContext: NodeContext,
  ) {
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

    return this.apolloFactory.apollo(nodeContext).mutate<void>({
      mutation: gql`
        ${mutation.query}
      `,
      fetchPolicy: 'no-cache',
      variables: { object: resource },
    });
  }

  readKcpCA(nodeContext: NodeContext): Observable<string> {
    return this.apolloFactory
      .apollo(nodeContext, true)
      .query<string>({
        query: gql`
          {
            core {
              ConfigMap(name: "kube-root-ca.crt", namespace: "default") {
                metadata {
                  name
                  namespace
                }
                data
              }
            }
          }
        `,
      })
      .pipe(map((res: any) => res.data.core.ConfigMap.data));
  }
}

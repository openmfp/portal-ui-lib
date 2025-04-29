import { ApolloFactory } from '../../../services/apollo-factory';
import { Resource, ResourceDefinition } from '../models/resource';
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
  private apollo: Apollo = this.apolloFactory.apollo;

  read(
    resourceId: string,
    operation: string,
    fields: any[],
  ): Observable<Resource> {
    const query = gqlBuilder.subscription({
      operation: operation,
      fields,
      variables: { name: { type: 'String!' } },
    });

    return this.apollo
      .subscribe({
        query: gql`
          ${query.query}
        `,
        variables: {
          name: resourceId,
        },
      })
      .pipe(
        map((res: any) => res.data?.[operation]),
        catchError((error) => {
          console.error('Error executing GraphQL query', error);
          return error;
        }),
      );
  }

  list(operation: string, fields: any[]): Observable<Resource[]> {
    const query = gqlBuilder.subscription({
      operation: operation,
      fields,
      variables: {},
    });

    return this.apollo
      .subscribe({
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

    resource.spec.type = 'org';
    resource.metadata.name = 'taken from input';

    return this.apollo.mutate<void>({
      mutation: gql`
        ${mutation.query}
      `,
      fetchPolicy: 'no-cache',
      variables: { object: resource },
    });
  }

  readKcpCA(): Observable<string> {
    return this.apollo
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

import { Resource, ResourceDefinition } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { ApolloFactory } from './apollo-factory';
import { ResourceNodeContext } from './resource-node-context';
import { Injectable, inject } from '@angular/core';
import { TypedDocumentNode } from '@apollo/client/core';
import { gql } from 'apollo-angular';
import * as gqlBuilder from 'gql-query-builder';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private apolloFactory = inject(ApolloFactory);
  private luigiCoreService = inject(LuigiCoreService);

  read(
    resourceId: string,
    operation: string,
    kind: string,
    fieldsOrRawQuery: any[] | string,
    nodeContext: ResourceNodeContext,
  ): Observable<Resource> {
    let query: string | TypedDocumentNode<any, any> = this.resolveReadQuery(
      fieldsOrRawQuery,
      kind,
      resourceId,
      operation,
    );

    try {
      query = gql`
        ${query}
      `;
    } catch (error) {
      this.luigiCoreService.showAlert({
        text: `Could not read an account: ${resourceId}. Wrong read query: <br/><br/> ${query}`,
        type: 'error',
      });
      return of(null);
    }

    return this.apolloFactory
      .apollo(nodeContext, true)
      .query({
        query,
        variables: {
          name: resourceId,
        },
      })
      .pipe(
        map((res: any) => res.data?.[operation]?.[kind]),
        catchError((error) => {
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  private resolveReadQuery(
    fieldsOrRawQuery: any[] | string,
    kind: string,
    resourceId: string,
    operation: string,
  ) {
    if (fieldsOrRawQuery instanceof Array) {
      return (
        gqlBuilder
          .query({
            operation: kind,
            variables: { name: { value: resourceId, type: 'String!' } },
            fields: fieldsOrRawQuery,
          })
          .query.replace(kind, `${operation} { ${kind}`)
          .trim() + '}'
      );
    } else {
      return fieldsOrRawQuery;
    }
  }

  list(
    operation: string,
    fields: any[],
    nodeContext: ResourceNodeContext,
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
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  readOrganizations(
    operation: string,
    fields: any[],
    nodeContext: ResourceNodeContext,
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
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  delete(
    resource: Resource,
    resourceDefinition: ResourceDefinition,
    nodeContext: ResourceNodeContext,
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
    nodeContext: ResourceNodeContext,
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

  readKcpCA(nodeContext: ResourceNodeContext): Observable<string> {
    return this.apolloFactory
      .apollo(nodeContext, true)
      .query<string>({
        query: gql`
          {
            core_openmfp_org {
              AccountInfo(name: "account") {
                metadata {
                  name
                }
                spec {
                  clusterInfo {
                    ca
                  }
                }
              }
            }
          }
        `,
      })
      .pipe(
        map(
          (res: any) =>
            res.data.core_openmfp_org.AccountInfo.spec.clusterInfo.ca || '',
        ),
      );
  }
}

import { AccountInfo, Resource, ResourceDefinition } from '../../models';
import {
  getValueByPath,
  replaceDotsAndHyphensWithUnderscores,
} from '../../utilities';
import { LuigiCoreService } from '../luigi-core.service';
import { ApolloFactory } from './apollo-factory';
import { ResourceNodeContext } from './resource-node-context';
import { Injectable, inject } from '@angular/core';
import { TypedDocumentNode } from '@apollo/client/core';
import { gql } from 'apollo-angular';
import * as gqlBuilder from 'gql-query-builder';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ResourceResponseError extends Record<string, any> {
  message: string;
}

interface ResourceResponse extends Record<string, any> {
  data: {
    [key: string]: any;
  };
  errors: { message: string }[];
}

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
    readFromParentKcpPath: boolean = true,
  ): Observable<Resource> {
    const isNamespacedResource = this.isNamespacedResource(nodeContext);
    let query: string | TypedDocumentNode<any, any> = this.resolveReadQuery(
      fieldsOrRawQuery,
      kind,
      resourceId,
      isNamespacedResource ? nodeContext.namespaceId : null,
      operation,
    );

    try {
      query = gql`
        ${query}
      `;
    } catch (error) {
      this.luigiCoreService.showAlert({
        text: `Could not read a resource: ${resourceId}. Wrong read query: <br/><br/> ${query}`,
        type: 'error',
      });
      return of(null);
    }

    return this.apolloFactory
      .apollo(nodeContext, readFromParentKcpPath)
      .query({
        query,
        variables: {
          name: resourceId,
          ...(isNamespacedResource && {
            namespace: nodeContext.namespaceId,
          }),
        },
      })
      .pipe(
        map((res) => res.data?.[operation]?.[kind]),
        catchError((error) => {
          this.alertErrors(error);
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  private resolveReadQuery(
    fieldsOrRawQuery: any[] | string,
    kind: string,
    resourceId: string,
    namespace: string,
    operation: string,
  ) {
    if (fieldsOrRawQuery instanceof Array) {
      return (
        gqlBuilder
          .query({
            operation: kind,
            variables: {
              name: { value: resourceId, type: 'String!' },
              ...(namespace && {
                namespace: { value: namespace, type: 'String' },
              }),
            },
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
    fieldsOrRawQuery: any[] | string,
    nodeContext: ResourceNodeContext,
  ): Observable<Resource[] | any> {
    const isNamespacedResource = this.isNamespacedResource(nodeContext);
    const variables = {
      ...(isNamespacedResource && {
        namespace: { type: 'String', value: nodeContext.namespaceId },
      }),
    };

    let query: { variables: any; query: string };

    if (fieldsOrRawQuery instanceof Array) {
      query = gqlBuilder.subscription({
        operation,
        fields: fieldsOrRawQuery,
        variables: variables,
      });
    } else {
      query = {
        variables: variables,
        query: fieldsOrRawQuery,
      };
    }

    return this.apolloFactory
      .apollo(nodeContext)
      .subscribe({
        query: gql`
          ${query.query}
        `,
        variables: query.variables,
      })
      .pipe(
        map((res: any): Resource[] =>
          getValueByPath<any, Resource[]>(res.data, operation),
        ),
        catchError((error) => {
          this.alertErrors(error);
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  private alertErrors(res: ResourceResponseError) {
    this.luigiCoreService.showAlert({
      text: res.message,
      type: 'error',
    });
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
          this.alertErrors(error);
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
    const group = replaceDotsAndHyphensWithUnderscores(
      resourceDefinition.group,
    );
    const isNamespacedResource = this.isNamespacedResource(nodeContext);
    const kind = resourceDefinition.kind;

    const mutation = gqlBuilder.mutation({
      operation: group,
      fields: [
        {
          operation: `delete${kind}`,
          variables: {
            name: { type: 'String!', value: resource.metadata.name },
            ...(isNamespacedResource && {
              namespace: { type: 'String', value: nodeContext.namespaceId },
            }),
          },
          fields: [],
        },
      ],
    });

    return this.apolloFactory
      .apollo(nodeContext)
      .mutate<void>({
        mutation: gql`
          ${mutation.query}
        `,
        variables: mutation.variables,
      })
      .pipe(
        catchError((error) => {
          this.alertErrors(error);
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  create(
    resource: Resource,
    resourceDefinition: ResourceDefinition,
    nodeContext: ResourceNodeContext,
  ) {
    const isNamespacedResource = this.isNamespacedResource(nodeContext);
    const group = replaceDotsAndHyphensWithUnderscores(
      resourceDefinition.group,
    );
    const kind = resourceDefinition.kind;
    const namespace = nodeContext.namespaceId;

    const mutation = gqlBuilder.mutation({
      operation: group,
      fields: [
        {
          operation: `create${kind}`,
          variables: {
            ...(isNamespacedResource && {
              namespace: { type: 'String', value: namespace },
            }),
            object: { type: `${kind}Input!`, value: resource },
          },
          fields: ['__typename'],
        },
      ],
    });

    return this.apolloFactory
      .apollo(nodeContext)
      .mutate({
        mutation: gql`
          ${mutation.query}
        `,
        fetchPolicy: 'no-cache',
        variables: mutation.variables,
      })
      .pipe(
        catchError((error) => {
          this.alertErrors(error);
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  readAccountInfo(nodeContext: ResourceNodeContext): Observable<AccountInfo> {
    return this.apolloFactory
      .apollo(nodeContext)
      .query<string>({
        query: gql`
          {
            core_platform_mesh_io {
              AccountInfo(name: "account") {
                metadata {
                  name
                  annotations
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
        map((res: any) => {
          return res.data.core_platform_mesh_io.AccountInfo;
        }),
        catchError((error) => {
          this.alertErrors(error);
          console.error('Error executing GraphQL query.', error);
          return error;
        }),
      );
  }

  private isNamespacedResource(nodeContext: ResourceNodeContext) {
    return nodeContext?.resourceDefinition?.scope === 'Namespaced';
  }
}

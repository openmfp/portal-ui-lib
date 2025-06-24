import { NodeContext } from '../../models';
import { GatewayService } from './gateway.service';
import { ResourceNodeContext } from './resource-node-context';
import { Injectable, NgZone, inject } from '@angular/core';
import {
  type ApolloClientOptions,
  ApolloLink,
  Observable as ApolloObservable,
  FetchResult,
  InMemoryCache,
  Operation,
  split,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { print } from 'graphql';
import { Client, ClientOptions, createClient } from 'graphql-sse';

class SSELink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public override request(operation: Operation): ApolloObservable<FetchResult> {
    return new ApolloObservable((sink) => {
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      );
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class ApolloFactory {
  private httpLink = inject(HttpLink);
  private ngZone = inject(NgZone);
  private gatewayService = inject(GatewayService);

  public readonly apollo = (
    nodeContext: ResourceNodeContext,
    readFromParentKcpPath = false,
  ): Apollo =>
    new Apollo(
      this.ngZone,
      this.createApolloOptions(nodeContext, readFromParentKcpPath),
    );

  private createApolloOptions(
    nodeContext: ResourceNodeContext,
    readFromParentKcpPath = false,
  ): ApolloClientOptions<any> {
    const contextLink = setContext(() => {
      return {
        uri: () =>
          this.gatewayService.getGatewayUrl(nodeContext, readFromParentKcpPath),
        headers: {
          Authorization: `Bearer ${nodeContext.token}`,
          Accept: 'charset=utf-8',
        },
      };
    });

    const splitClient = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      new SSELink({
        url: () =>
          this.gatewayService.getGatewayUrl(nodeContext, readFromParentKcpPath),
        headers: () => ({
          Authorization: `Bearer ${nodeContext.token}`,
        }),
      }),
      this.httpLink.create({}),
    );

    const link = ApolloLink.from([contextLink, splitClient]);
    const cache = new InMemoryCache();

    return {
      link,
      cache,
    };
  }
}

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
import { LuigiCoreService } from '@openmfp/portal-ui-lib';
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
  private luigiCoreService = inject(LuigiCoreService);
  public readonly apollo: Apollo = new Apollo(
    this.ngZone,
    this.createApolloOptions(),
  );

  private getGatewayUrl() {
    const ctx = this.luigiCoreService.getGlobalContext();
    let gatewayUrl = ctx.portalContext.crdGatewayApiUrl;
    if (ctx.accountId) {
      gatewayUrl = gatewayUrl.replace('/graphql', `:${ctx.accountId}/graphql`);
    }
    return gatewayUrl;
  }

  private createApolloOptions(): ApolloClientOptions<any> {
    const contextLink = setContext(() => {
      return {
        uri: () => this.getGatewayUrl(),
        headers: {
          Authorization: `Bearer ${this.luigiCoreService.getGlobalContext().token}`,
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
        url: () => this.getGatewayUrl(),
        headers: () => ({
          Authorization: `Bearer ${this.luigiCoreService.getGlobalContext().token}`,
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

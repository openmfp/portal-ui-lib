import { ApolloFactory } from './apollo-factory';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InMemoryCache } from '@apollo/client/core';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

global.fetch = (...args) =>
  // @ts-ignore
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

describe('ApolloFactory', () => {
  let factory: ApolloFactory;
  let luigiCoreServiceMock: any;
  let httpLinkMock: any;
  let ngZone: NgZone;

  beforeEach(() => {
    httpLinkMock = {
      create: jest.fn().mockReturnValue({ request: [] }),
    };
    luigiCoreServiceMock = {
      getWcExtendedContext: jest.fn().mockReturnValue({
        portalContext: { crdGatewayApiUrl: 'http://example.com/graphql' },
        accountId: '123',
      }),
      getGlobalContext: jest.fn().mockReturnValue({ token: 'fake-token' }),
    };
    TestBed.configureTestingModule({
      providers: [
        ApolloFactory,
        { provide: HttpLink, useValue: httpLinkMock },
        {
          provide: NgZone,
          useValue: new NgZone({ enableLongStackTrace: false }),
        },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    });
    factory = TestBed.inject(ApolloFactory);
    ngZone = TestBed.inject(NgZone);
  });

  it('should create an Apollo instance', () => {
    expect(factory.apollo).toBeInstanceOf(Apollo);
  });

  it('should return correct gateway url when accountId is provided', () => {
    const gatewayUrl = (factory as any).getGatewayUrl();
    expect(gatewayUrl).toBe('http://example.com:123/graphql');
  });

  it('should return correct gateway url when accountId is not provided', () => {
    luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({
      portalContext: { crdGatewayApiUrl: 'http://example.com/graphql' },
    });
    const gatewayUrl = (factory as any).getGatewayUrl();
    expect(gatewayUrl).toBe('http://example.com/graphql');
  });

  it('should create Apollo options with InMemoryCache', () => {
    const options = (factory as any).createApolloOptions();
    expect(options.cache).toBeInstanceOf(InMemoryCache);
  });
});

import { NodeContext } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { ApolloFactory } from './apollo-factory';
import { GatewayService } from './gateway.service';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InMemoryCache } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { mock } from 'jest-mock-extended';

global.fetch = (...args) =>
  // @ts-ignore
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

describe('ApolloFactory', () => {
  let factory: ApolloFactory;
  let luigiCoreServiceMock: any;
  let httpLinkMock: any;
  let gatewayServiceMock: jest.Mocked<GatewayService>;
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
    gatewayServiceMock = mock();
    TestBed.configureTestingModule({
      providers: [
        ApolloFactory,
        { provide: HttpLink, useValue: httpLinkMock },
        {
          provide: NgZone,
          useValue: new NgZone({ enableLongStackTrace: false }),
        },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        { provide: GatewayService, useValue: gatewayServiceMock },
      ],
    });
    factory = TestBed.inject(ApolloFactory);
    ngZone = TestBed.inject(NgZone);
  });

  it('should create an Apollo instance', () => {
    expect(factory.apollo({} as NodeContext)).toBeInstanceOf(Apollo);
  });

  it('should create Apollo options with InMemoryCache', () => {
    const options = (factory as any).createApolloOptions();
    expect(options.cache).toBeInstanceOf(InMemoryCache);
  });
});

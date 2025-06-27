import { LuigiCoreService } from '../luigi-core.service';
import { GatewayService } from './gateway.service';
import { TestBed } from '@angular/core/testing';

describe('GatewayService', () => {
  let service: GatewayService;
  let mockLuigiCoreService: any;

  beforeEach(() => {
    mockLuigiCoreService = {
      getGlobalContext: jest.fn().mockReturnValue({
        portalContext: {
          crdGatewayApiUrl: 'https://example.com/:org1:acc1/graphql',
        },
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        GatewayService,
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      ],
    });

    service = TestBed.inject(GatewayService);
  });

  describe('getGatewayUrl', () => {
    it('should replace current kcp path with new one', () => {
      const nodeContext = {
        portalContext: {
          crdGatewayApiUrl: 'https://example.com/:org1:acc1/graphql',
        },
        token: 'token',
        accountId: 'entityId',
        kcpPath: ':org1:acc2',
      };
      const result = service.getGatewayUrl(nodeContext);
      expect(result).toBe('https://example.com/:org1:acc2/graphql');
    });

    it('should slice current kcp path when readFromParentKcpPath is true', () => {
      const nodeContext = {
        portalContext: {
          crdGatewayApiUrl: 'https://example.com/:org1:acc1/graphql',
        },
        token: 'token',
        accountId: 'acc1',
      };
      const result = service.getGatewayUrl(nodeContext as any, true);
      expect(result).toBe('https://example.com/:org1/graphql');
    });
  });

  describe('updateCrdGatewayUrlWithEntityPath', () => {
    it('should update crdGatewayApiUrl with new kcp path', () => {
      const globalContext = mockLuigiCoreService.getGlobalContext();
      service.updateCrdGatewayUrlWithEntityPath(':org1:acc3');
      expect(globalContext.portalContext.crdGatewayApiUrl).toBe(
        'https://example.com/:org1:acc3/graphql',
      );
    });
  });

  describe('resolveKcpPath', () => {
    it('should return kcpPath from context if present', () => {
      const nodeContext = {
        portalContext: {
          crdGatewayApiUrl: 'https://example.com/:org1:acc1/graphql',
        },
        token: 'token',
        accountId: 'entityId',
        kcpPath: ':org1:acc2',
      };
      const result = service.resolveKcpPath(nodeContext);
      expect(result).toBe(':org1:acc2');
    });

    it('should slice path by accountId if readFromParentKcpPath is true', () => {
      const nodeContext = {
        portalContext: {
          crdGatewayApiUrl: 'https://example.com/:org1:acc1/graphql',
        },
        token: 'token',
        accountId: 'entityId',
        kcpPath: ':org1',
      };
      const result = service.resolveKcpPath(nodeContext, true);
      expect(result).toBe(':org1');
    });

    it('should return current kcp path if no override provided', () => {
      const nodeContext = {
        portalContext: {
          crdGatewayApiUrl: 'https://example.com/:org1:acc1/graphql',
        },
        token: 'token',
        accountId: 'entityId',
      };
      const result = service.resolveKcpPath(nodeContext);
      expect(result).toBe(':org1:acc1');
    });
  });
});

import { GatewayService } from './gateway.service';
import { TestBed } from '@angular/core/testing';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';

describe('GatewayService', () => {
  let service: GatewayService;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    luigiCoreServiceMock = {
      getWcExtendedContext: jest.fn(),
      getGlobalContext: jest.fn(),
      getWcModalExtendedContext: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        GatewayService,
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    });

    service = TestBed.inject(GatewayService);
  });

  describe('getKcpPath', () => {
    it('should return kcpPath from modal context if available', () => {
      luigiCoreServiceMock.getWcModalExtendedContext.mockReturnValue({
        kcpPath: 'modal:test:path',
      });
      luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({});
      luigiCoreServiceMock.getGlobalContext.mockReturnValue({} as any);

      const result = service.getKcpPath();
      expect(result).toBe('modal:test:path');
    });

    it('should return kcpPath from context if modal context is empty', () => {
      luigiCoreServiceMock.getWcModalExtendedContext.mockReturnValue({});
      luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({
        kcpPath: 'context:test:path',
      });
      luigiCoreServiceMock.getGlobalContext.mockReturnValue({
        organization: 'testorg',
      } as any);

      const result = service.getKcpPath();
      expect(result).toBe('context:test:path');
    });

    it('should return default path with organization and accountId', () => {
      luigiCoreServiceMock.getWcModalExtendedContext.mockReturnValue({});
      luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({
        accountId: '123',
      });
      luigiCoreServiceMock.getGlobalContext.mockReturnValue({
        organization: 'testorg',
      } as any);

      const result = service.getKcpPath();
      expect(result).toBe('root:orgs:testorg:123');
    });

    it('should return default path with only organization', () => {
      luigiCoreServiceMock.getWcModalExtendedContext.mockReturnValue({});
      luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({});
      luigiCoreServiceMock.getGlobalContext.mockReturnValue({
        organization: 'testorg',
      } as any);

      const result = service.getKcpPath();
      expect(result).toBe('root:orgs:testorg');
    });
  });

  describe('getGatewayUrl', () => {
    it('should replace ${kcp-path} with correct kcp path', () => {
      luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({
        portalContext: {
          crdGatewayApiUrl: 'https://test.com/${kcp-path}/api',
        },
      });
      luigiCoreServiceMock.getGlobalContext.mockReturnValue({
        organization: 'testorg',
      } as any);

      const result = service.getGatewayUrl();
      expect(result).toBe(`https://test.com/root:orgs:testorg/api`);
    });

    it('should handle empty context gracefully', () => {
      luigiCoreServiceMock.getWcExtendedContext.mockReturnValue({});
      luigiCoreServiceMock.getGlobalContext.mockReturnValue({
        organization: 'testorg',
      } as any);

      const result = service.getGatewayUrl();
      expect(result).toBeUndefined();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { PortalConfig } from '../../models';
import { NavigationGlobalContextConfigService } from './navigation-global-context-config.service';
import { AuthService, ConfigService } from '../portal';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';

describe('NavigationGlobalContextConfigService', () => {
  let service: NavigationGlobalContextConfigService;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;
  let extendedGlobalContextService: jest.Mocked<LuigiExtendedGlobalContextConfigService>;

  beforeEach(() => {
    authService = {
      getUsername: jest.fn(),
      getUserEmail: jest.fn(),
      getToken: jest.fn(),
    } as any;

    configService = {
      getPortalConfig: jest.fn(),
    } as any;

    extendedGlobalContextService = {
      createLuigiExtendedGlobalContext: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        NavigationGlobalContextConfigService,
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
        {
          provide: LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: extendedGlobalContextService,
        },
      ],
    });

    service = TestBed.inject(NavigationGlobalContextConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGlobalContext', () => {
    it('should return global context with all details', async () => {
      const mockPortalConfig = {
        portalContext: { tenant: 'test-tenant' },
      } as any as PortalConfig;
      const mockExtendedContext = {
        additionalContext: 'extended-info',
      };

      configService.getPortalConfig.mockResolvedValue(mockPortalConfig);
      extendedGlobalContextService.createLuigiExtendedGlobalContext.mockResolvedValue(
        mockExtendedContext
      );

      authService.getUsername.mockReturnValue('test-user');
      authService.getUserEmail.mockReturnValue('user@test.com');
      authService.getToken.mockReturnValue('test-token');

      const result = await service.getGlobalContext();

      expect(result).toEqual({
        ...mockExtendedContext,
        portalContext: mockPortalConfig.portalContext,
        userId: 'test-user',
        userEmail: 'user@test.com',
        token: 'test-token',
      });
    });

    it('should handle missing extended global context service', async () => {
      const mockPortalConfig = {
        portalContext: { tenant: 'test-tenant' },
      } as any as PortalConfig;

      configService.getPortalConfig.mockResolvedValue(mockPortalConfig);

      authService.getUsername.mockReturnValue('test-user');
      authService.getUserEmail.mockReturnValue('user@test.com');
      authService.getToken.mockReturnValue('test-token');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          NavigationGlobalContextConfigService,
          { provide: AuthService, useValue: authService },
          { provide: ConfigService, useValue: configService },
          {
            provide:
              LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
            useValue: undefined,
          },
        ],
      });

      service = TestBed.inject(NavigationGlobalContextConfigService);

      const result = await service.getGlobalContext();

      expect(result).toEqual({
        portalContext: mockPortalConfig.portalContext,
        userId: 'test-user',
        userEmail: 'user@test.com',
        token: 'test-token',
      });
    });
  });
});

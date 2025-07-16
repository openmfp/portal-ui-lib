import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { PortalConfig, UserData } from '../../models';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { AuthService, ConfigService, EnvConfigService } from '../portal';
import { NavigationGlobalContextConfigService } from './navigation-global-context-config.service';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';

describe('NavigationGlobalContextConfigService', () => {
  let navigationGlobalContextConfigService: NavigationGlobalContextConfigService;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;
  let envConfigService: jest.Mocked<EnvConfigService>;
  let extendedGlobalContextService: jest.Mocked<LuigiExtendedGlobalContextConfigService>;

  beforeEach(() => {
    authService = mock();
    configService = mock();
    envConfigService = mock();
    extendedGlobalContextService = mock();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        NavigationGlobalContextConfigService,
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
        { provide: EnvConfigService, useValue: envConfigService },
        {
          provide: LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: extendedGlobalContextService,
        },
      ],
    });

    navigationGlobalContextConfigService = TestBed.inject(
      NavigationGlobalContextConfigService,
    );

    delete window.location;
    window.location = { origin: 'https://example.com' } as any;
  });

  it('should be created', () => {
    expect(navigationGlobalContextConfigService).toBeTruthy();
  });

  describe('getGlobalContext', () => {
    it('should throw exception up the stack', async () => {
      const error = new Error('could not get createLuigiExtendedGlobalContext');
      extendedGlobalContextService.createLuigiExtendedGlobalContext.mockRejectedValue(
        error,
      );

      try {
        await navigationGlobalContextConfigService.getGlobalContext();
        fail();
      } catch (e) {
        expect(e).toEqual(error);
      }
    });

    it('should return global context with all details', async () => {
      const mockPortalConfig = {
        portalContext: { tenant: 'test-tenant' },
      } as any as PortalConfig;
      const mockExtendedContext = {
        additionalContext: 'extended-info',
      };

      configService.getPortalConfig.mockResolvedValue(mockPortalConfig);
      extendedGlobalContextService.createLuigiExtendedGlobalContext.mockResolvedValue(
        mockExtendedContext,
      );

      authService.getUserInfo.mockReturnValue({
        email: 'user@test.com',
        userId: 'test-user',
      } as UserData);
      authService.getToken.mockReturnValue('test-token');
      envConfigService.getEnvConfig.mockResolvedValue({
        organization: 'openmfp',
      } as any);

      const result =
        await navigationGlobalContextConfigService.getGlobalContext();

      expect(result).toEqual({
        ...mockExtendedContext,
        portalContext: mockPortalConfig.portalContext,
        portalBaseUrl: 'https://example.com',
        userId: 'test-user',
        userEmail: 'user@test.com',
        token: 'test-token',
        organization: 'openmfp',
      });
    });

    it('should handle missing extended global context service', async () => {
      const mockPortalConfig = {
        portalContext: { tenant: 'test-tenant' },
      } as any as PortalConfig;

      configService.getPortalConfig.mockResolvedValue(mockPortalConfig);

      authService.getUserInfo.mockReturnValue({
        email: 'user@test.com',
        userId: 'test-user',
      } as UserData);
      authService.getToken.mockReturnValue('test-token');
      envConfigService.getEnvConfig.mockResolvedValue({
        organization: 'openmfp',
      } as any);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          NavigationGlobalContextConfigService,
          { provide: AuthService, useValue: authService },
          { provide: ConfigService, useValue: configService },
          { provide: EnvConfigService, useValue: envConfigService },
          {
            provide:
              LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
            useValue: undefined,
          },
        ],
      });

      navigationGlobalContextConfigService = TestBed.inject(
        NavigationGlobalContextConfigService,
      );

      const result =
        await navigationGlobalContextConfigService.getGlobalContext();

      expect(result).toEqual({
        portalContext: mockPortalConfig.portalContext,
        portalBaseUrl: 'https://example.com',
        userId: 'test-user',
        userEmail: 'user@test.com',
        token: 'test-token',
        organization: 'openmfp',
      });
    });
  });
});

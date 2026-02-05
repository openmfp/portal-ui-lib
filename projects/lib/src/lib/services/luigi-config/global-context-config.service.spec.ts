import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { PortalConfig, UserData } from '../../models';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { AuthService, ConfigService, EnvConfigService } from '../portal';
import { GlobalContextConfigService } from './global-context-config.service';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { fail } from 'assert';
import { MockedObject } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('GlobalContextConfigService', () => {
  let globalContextConfigService: GlobalContextConfigService;
  let authService: MockedObject<AuthService>;
  let configService: MockedObject<ConfigService>;
  let envConfigService: MockedObject<EnvConfigService>;
  let extendedGlobalContextService: MockedObject<LuigiExtendedGlobalContextConfigService>;

  beforeEach(() => {
    authService = mock();
    configService = mock();
    envConfigService = mock();
    extendedGlobalContextService = mock();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        GlobalContextConfigService,
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
        { provide: EnvConfigService, useValue: envConfigService },
        {
          provide: LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: extendedGlobalContextService,
        },
      ],
    });

    globalContextConfigService = TestBed.inject(GlobalContextConfigService);

    delete (window as any).location;
    window.location = { origin: 'https://example.com' } as any;
  });

  it('should be created', () => {
    expect(globalContextConfigService).toBeTruthy();
  });

  describe('getGlobalContext', () => {
    it('should throw exception up the stack', async () => {
      const error = new Error('could not get createLuigiExtendedGlobalContext');
      extendedGlobalContextService.createLuigiExtendedGlobalContext.mockRejectedValue(
        error,
      );

      try {
        await globalContextConfigService.getGlobalContext();
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

      const result = await globalContextConfigService.getGlobalContext();

      expect(result).toEqual({
        ...mockExtendedContext,
        portalContext: mockPortalConfig.portalContext,
        portalBaseUrl: 'https://example.com',
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
          GlobalContextConfigService,
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

      globalContextConfigService = TestBed.inject(GlobalContextConfigService);

      const result = await globalContextConfigService.getGlobalContext();

      expect(result).toEqual({
        portalContext: mockPortalConfig.portalContext,
        portalBaseUrl: 'https://example.com',
        userId: 'test-user',
        userEmail: 'user@test.com',
        token: 'test-token',
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { UserInfo } from 'node:os';
import { PortalConfig, UserData } from '../../models';
import { NavigationGlobalContextConfigService } from './navigation-global-context-config.service';
import { AuthService, ConfigService } from '../portal';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';

describe('NavigationGlobalContextConfigService', () => {
  let navigationGlobalContextConfigService: NavigationGlobalContextConfigService;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;
  let extendedGlobalContextService: jest.Mocked<LuigiExtendedGlobalContextConfigService>;

  beforeEach(() => {
    authService = mock();
    configService = mock();
    extendedGlobalContextService = mock();

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

    navigationGlobalContextConfigService = TestBed.inject(
      NavigationGlobalContextConfigService
    );
  });

  it('should be created', () => {
    expect(navigationGlobalContextConfigService).toBeTruthy();
  });

  describe('getGlobalContext', () => {
    it('should throw exception up the stack', async () => {
      const error = new Error('could not get createLuigiExtendedGlobalContext');
      extendedGlobalContextService.createLuigiExtendedGlobalContext.mockRejectedValue(
        error
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
        mockExtendedContext
      );

      authService.getUserInfo.mockReturnValue({
        email: 'user@test.com',
        userId: 'test-user',
      } as UserData);
      authService.getToken.mockReturnValue('test-token');

      const result =
        await navigationGlobalContextConfigService.getGlobalContext();

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

      authService.getUserInfo.mockReturnValue({
        email: 'user@test.com',
        userId: 'test-user',
      } as UserData);
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

      navigationGlobalContextConfigService = TestBed.inject(
        NavigationGlobalContextConfigService
      );

      const result =
        await navigationGlobalContextConfigService.getGlobalContext();

      expect(result).toEqual({
        portalContext: mockPortalConfig.portalContext,
        userId: 'test-user',
        userEmail: 'user@test.com',
        token: 'test-token',
      });
    });
  });
});

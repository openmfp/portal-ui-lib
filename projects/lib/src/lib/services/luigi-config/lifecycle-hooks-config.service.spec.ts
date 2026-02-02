import {
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { EnvConfigService } from '../portal';
import { AuthConfigService } from './auth-config.service';
import { CustomMessageListenersService } from './custom-message-listeners.service';
import { GlobalSearchConfigService } from './global-search-config.service';
import { LifecycleHooksConfigService } from './lifecycle-hooks-config.service';
import { NavigationConfigService } from './navigation-config.service';
import { RoutingConfigServiceImpl } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'vitest-mock-extended';
import { beforeEach, describe, expect, it, MockedObject, vi } from 'vitest';

describe('LifecycleHooksConfigService', () => {
  let service: LifecycleHooksConfigService;
  let i18nServiceMock: MockedObject<I18nService>;
  let luigiNodesServiceMock: MockedObject<LuigiNodesService>;
  let luigiCoreServiceMock: MockedObject<LuigiCoreService>;
  let routingConfigServiceMock: MockedObject<RoutingConfigServiceImpl>;
  let staticSettingsConfigServiceMock: MockedObject<StaticSettingsConfigService>;
  let userSettingsConfigServiceMock: MockedObject<UserSettingsConfigService>;
  let globalSearchConfigServiceMock: MockedObject<GlobalSearchConfigService>;
  let navigationConfigServiceMock: MockedObject<NavigationConfigService>;
  let envConfigServiceMock: MockedObject<EnvConfigService>;
  let authConfigServiceMock: MockedObject<AuthConfigService>;
  let customMessageListenersServiceMock: MockedObject<CustomMessageListenersService>;

  beforeEach(() => {
    i18nServiceMock = mock();
    envConfigServiceMock = mock();
    authConfigServiceMock = mock();
    customMessageListenersServiceMock = mock();
    luigiNodesServiceMock = { retrieveChildrenByEntity: vi.fn() } as any;
    luigiCoreServiceMock = {
      setConfig: vi.fn(),
      ux: vi.fn().mockReturnValue({ hideAppLoadingIndicator: vi.fn() }),
      isFeatureToggleActive: vi.fn(),
      resetLuigi: vi.fn(),
      showAlert: vi.fn().mockReturnValue(Promise.resolve()),
    } as any;
    Object.defineProperty(luigiCoreServiceMock, 'config', {
      get: vi.fn(),
      configurable: true,
    });
    routingConfigServiceMock = { getRoutingConfig: vi.fn() } as any;
    staticSettingsConfigServiceMock = {
      getStaticSettingsConfig: vi.fn(),
      getInitialStaticSettingsConfig: vi.fn(),
    } as any;
    userSettingsConfigServiceMock = { getUserSettings: vi.fn() } as any;
    globalSearchConfigServiceMock = { getGlobalSearchConfig: vi.fn() } as any;
    navigationConfigServiceMock = { getNavigationConfig: vi.fn() } as any;

    TestBed.configureTestingModule({
      providers: [
        LifecycleHooksConfigService,
        { provide: EnvConfigService, useValue: envConfigServiceMock },
        {
          provide: CustomMessageListenersService,
          useValue: customMessageListenersServiceMock,
        },
        { provide: AuthConfigService, useValue: authConfigServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
        {
          provide: NavigationConfigService,
          useValue: navigationConfigServiceMock,
        },
        { provide: LuigiNodesService, useValue: luigiNodesServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        {
          provide: RoutingConfigServiceImpl,
          useValue: routingConfigServiceMock,
        },
        {
          provide: UserSettingsConfigService,
          useValue: userSettingsConfigServiceMock,
        },
        {
          provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: staticSettingsConfigServiceMock,
        },
        {
          provide: LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: globalSearchConfigServiceMock,
        },
      ],
    });

    service = TestBed.inject(LifecycleHooksConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLifecycleHooksConfig', () => {
    it('should return an object with luigiAfterInit function', () => {
      const config = service.getLifecycleHooksConfig();
      expect(config).toHaveProperty('luigiAfterInit');
      expect(typeof config.luigiAfterInit).toBe('function');
    });

    describe('luigiAfterInit', () => {
      it('should call i18nServiceMock.afterInit', async () => {
        const config = service.getLifecycleHooksConfig();
        await config.luigiAfterInit();
        expect(i18nServiceMock.afterInit).toHaveBeenCalled();
      });

      it('should call luigiNodesServiceMock.retrieveChildrenByEntity', async () => {
        const config = service.getLifecycleHooksConfig();
        await config.luigiAfterInit();
        expect(
          luigiNodesServiceMock.retrieveChildrenByEntity,
        ).toHaveBeenCalled();
      });

      it('should call luigiCoreServiceMock methods', async () => {
        const config = service.getLifecycleHooksConfig();

        await config.luigiAfterInit();

        expect(
          luigiCoreServiceMock.ux().hideAppLoadingIndicator,
        ).toHaveBeenCalled();
        expect(luigiCoreServiceMock.setConfig).toHaveBeenCalled();
      });

      it('should handle error when retrieving Luigi navigation nodes', async () => {
        const error = new Error('Test error');
        luigiNodesServiceMock.retrieveChildrenByEntity.mockRejectedValue(error);
        Object.defineProperty(luigiCoreServiceMock, 'config', {
          get: vi.fn(() => ({
            settings: {
              header: { title: 'Test App', logo: 'assets/logo.png' },
            },
          })),
          configurable: true,
        });
        console.error = vi.fn();

        const config = service.getLifecycleHooksConfig();
        await config.luigiAfterInit();

        expect(console.error).toHaveBeenCalledWith(
          'Error retrieving Luigi navigation nodes',
          error,
        );
        expect(luigiCoreServiceMock.showAlert).toHaveBeenCalledWith({
          text: 'There was an error loading the Test App',
          type: 'error',
        });
      });
    });
  });
});

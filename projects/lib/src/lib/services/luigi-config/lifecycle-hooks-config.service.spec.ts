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
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';

describe('LifecycleHooksConfigService', () => {
  let service: LifecycleHooksConfigService;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let luigiNodesServiceMock: jest.Mocked<LuigiNodesService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let routingConfigServiceMock: jest.Mocked<RoutingConfigService>;
  let staticSettingsConfigServiceMock: jest.Mocked<StaticSettingsConfigService>;
  let userSettingsConfigServiceMock: jest.Mocked<UserSettingsConfigService>;
  let globalSearchConfigServiceMock: jest.Mocked<GlobalSearchConfigService>;
  let navigationConfigServiceMock: jest.Mocked<NavigationConfigService>;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let authConfigServiceMock: jest.Mocked<AuthConfigService>;
  let customMessageListenersServiceMock: jest.Mocked<CustomMessageListenersService>;

  beforeEach(() => {
    i18nServiceMock = mock();
    envConfigServiceMock = mock();
    authConfigServiceMock = mock();
    customMessageListenersServiceMock = mock();
    luigiNodesServiceMock = { retrieveChildrenByEntity: jest.fn() } as any;
    luigiCoreServiceMock = {
      setConfig: jest.fn(),
      ux: jest.fn().mockReturnValue({ hideAppLoadingIndicator: jest.fn() }),
      isFeatureToggleActive: jest.fn(),
      resetLuigi: jest.fn(),
      showAlert: jest.fn().mockReturnValue(Promise.resolve()),
    } as any;
    Object.defineProperty(luigiCoreServiceMock, 'config', {
      get: jest.fn(),
      configurable: true,
    });
    routingConfigServiceMock = { getRoutingConfig: jest.fn() } as any;
    staticSettingsConfigServiceMock = {
      getStaticSettingsConfig: jest.fn(),
      getInitialStaticSettingsConfig: jest.fn(),
    } as any;
    userSettingsConfigServiceMock = { getUserSettings: jest.fn() } as any;
    globalSearchConfigServiceMock = { getGlobalSearchConfig: jest.fn() } as any;
    navigationConfigServiceMock = { getNavigationConfig: jest.fn() } as any;

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
        { provide: RoutingConfigService, useValue: routingConfigServiceMock },
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
          get: jest.fn(() => ({
            settings: {
              header: { title: 'Test App', logo: 'assets/logo.png' },
            },
          })),
          configurable: true,
        });
        console.error = jest.fn();

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

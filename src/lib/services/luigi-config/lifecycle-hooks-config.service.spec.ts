import { TestBed } from '@angular/core/testing';
import { LifecycleHooksConfigService } from './lifecycle-hooks-config.service';
import { I18nService } from '../i18n.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { LuigiCoreService } from '../luigi-core.service';
import { NavigationConfigService } from './navigation-config.service';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import { GlobalSearchConfigService } from './global-search-config.service';
import {
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';

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

  beforeEach(() => {
    i18nServiceMock = { afterInit: jest.fn() } as any;
    luigiNodesServiceMock = { retrieveChildrenByEntity: jest.fn() } as any;
    luigiCoreServiceMock = {
      getConfig: jest.fn(),
      setConfig: jest.fn(),
      ux: jest.fn().mockReturnValue({ hideAppLoadingIndicator: jest.fn() }),
      isFeatureToggleActive: jest.fn(),
      resetLuigi: jest.fn(),
      showAlert: jest.fn().mockReturnValue(Promise.resolve()),
    } as any;
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
        { provide: I18nService, useValue: i18nServiceMock },
        {
          provide: NavigationConfigService,
          useValue: navigationConfigServiceMock,
        },
        { provide: LuigiNodesService, useValue: luigiNodesServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        { provide: RoutingConfigService, useValue: routingConfigServiceMock },
        {
          provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: staticSettingsConfigServiceMock,
        },
        {
          provide: LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: userSettingsConfigServiceMock,
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
      const config = service.getLifecycleHooksConfig({} as any);
      expect(config).toHaveProperty('luigiAfterInit');
      expect(typeof config.luigiAfterInit).toBe('function');
    });

    describe('luigiAfterInit', () => {
      it('should resetLuigi once the feature toggle is set to have btpLayout', async () => {
        luigiCoreServiceMock.isFeatureToggleActive.mockReturnValue(true);
        const config = service.getLifecycleHooksConfig({} as any);

        await config.luigiAfterInit();

        expect(luigiCoreServiceMock.resetLuigi).toHaveBeenCalled();
      });

      it('should call i18nServiceMock.afterInit', async () => {
        const config = service.getLifecycleHooksConfig({} as any);
        await config.luigiAfterInit();
        expect(i18nServiceMock.afterInit).toHaveBeenCalled();
      });

      it('should call luigiNodesServiceMock.retrieveChildrenByEntity', async () => {
        const config = service.getLifecycleHooksConfig({} as any);
        await config.luigiAfterInit();
        expect(
          luigiNodesServiceMock.retrieveChildrenByEntity
        ).toHaveBeenCalled();
      });

      it('should call luigiCoreServiceMock methods', async () => {
        const config = service.getLifecycleHooksConfig({} as any);
        await config.luigiAfterInit();
        expect(luigiCoreServiceMock.getConfig).toHaveBeenCalled();
        expect(
          luigiCoreServiceMock.ux().hideAppLoadingIndicator
        ).toHaveBeenCalled();
        expect(luigiCoreServiceMock.setConfig).toHaveBeenCalled();
      });

      it('should handle error when retrieving Luigi navigation nodes', async () => {
        luigiNodesServiceMock.retrieveChildrenByEntity.mockRejectedValue(
          new Error('Test error')
        );
        staticSettingsConfigServiceMock.getInitialStaticSettingsConfig.mockReturnValue(
          { header: { title: 'Test App' } }
        );
        console.error = jest.fn();

        const config = service.getLifecycleHooksConfig({} as any);
        await config.luigiAfterInit();

        expect(console.error).toHaveBeenCalledWith(
          'Error retrieving Luigi navigation nodes Error: Test error'
        );
        expect(luigiCoreServiceMock.showAlert).toHaveBeenCalledWith({
          text: 'There was an error loading the Test App',
          type: 'error',
        });
      });
    });
  });
});

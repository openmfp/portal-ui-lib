import { providePortal, PortalOptions } from './portal-providers';
import * as core from '@angular/core';
import * as http from '@angular/common/http';
import * as tokens from './injection-tokens';
import {
  AppSwitcherConfigService,
  CustomGlobalNodesService,
  CustomMessageListener,
  GlobalSearchConfigService,
  LocalConfigurationServiceImpl,
  LuigiAuthEventsCallbacksService,
  LuigiBreadcrumb,
  LuigiBreadcrumbConfigService,
  LuigiExtendedGlobalContextConfigService,
  NodeAccessHandlingService,
  NodeChangeHookConfigService,
  StaticSettingsConfigService,
  ThemingService,
  UserProfileConfigService,
} from './services';
import * as services from './services';
import { Context } from '@luigi-project/client';
import { LuigiNode } from './models';

class MockCustomListener1 implements CustomMessageListener {
  messageId(): string {
    return 'MockCustomListener1';
  }
  onCustomMessageReceived = jest.fn();
}

class MockCustomListener2 implements CustomMessageListener {
  messageId(): string {
    return 'MockCustomListener2';
  }
  onCustomMessageReceived = jest.fn();
}

jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  makeEnvironmentProviders: jest.fn().mockReturnValue({ providers: [] }),
  provideHttpClient: jest.fn(),
  provideZoneChangeDetection: jest.fn(),
}));

jest.mock('@angular/common/http', () => ({
  provideHttpClient: jest.fn(),
}));

jest.mock('@angular/router', () => ({
  provideRouter: jest.fn(),
}));

describe('Provide Portal', () => {
  let mockMakeEnvironmentProviders: jest.Mock;

  beforeEach(() => {
    mockMakeEnvironmentProviders = core.makeEnvironmentProviders as jest.Mock;
    mockMakeEnvironmentProviders.mockClear();
  });

  it('should properly set custom message listeners providers', () => {
    const options: PortalOptions = {
      customMessageListeners: [MockCustomListener1, MockCustomListener2],
    };

    providePortal(options);

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    const customListenerProviders = providersArg.filter(
      (provider: any) =>
        provider?.provide ===
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN
    );

    expect(customListenerProviders).toHaveLength(2);
    expect(customListenerProviders[0]).toEqual({
      provide: tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
      useClass: MockCustomListener1,
      multi: true,
    });
    expect(customListenerProviders[1]).toEqual({
      provide: tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
      useClass: MockCustomListener2,
      multi: true,
    });
  });

  it('should not set any custom message listeners providers when not provided', () => {
    providePortal({});

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    const customListenerProviders = providersArg.filter(
      (provider: any) =>
        provider?.provide ===
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN
    );

    expect(customListenerProviders).toHaveLength(0);
  });

  it('should set default services when custom services are not provided', () => {
    providePortal({});

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    expect(providersArg).toContainEqual({
      provide: tokens.LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
      useClass: LocalConfigurationServiceImpl,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass: services.NodeChangeHookConfigServiceImpl,
    });
  });

  it('should set custom services when provided', () => {
    class CustomAuthEventsService implements LuigiAuthEventsCallbacksService {
      onAuthSuccessful: (settings: any, authData: any) => void;
      onAuthError: (settings: any, err: any) => void;
      onAuthExpired: (settings: any) => void;
      onLogout: (settings: any) => void;
      onAuthExpireSoon: (settings: any) => void;
      onAuthConfigError: (settings: any, err: any) => void;
    }

    class CustomNodeAccessService implements NodeAccessHandlingService {
      nodeAccessHandling(ctx: Context, node: LuigiNode): Promise<LuigiNode> {
        throw new Error('Method not implemented.');
      }
    }

    class CustomNodeChangeHookService implements NodeChangeHookConfigService {
      nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode) {
        throw new Error('Method not implemented.');
      }
    }

    class CustomThemingService implements ThemingService {
      applyTheme(id: string, reset?: boolean): void {
        throw new Error('Method not implemented.');
      }
      getDefaultThemeId(): string {
        throw new Error('Method not implemented.');
      }
      getAvailableThemes(): services.Theme[] {
        throw new Error('Method not implemented.');
      }
    }

    class CustomGlobalSearchConfigService implements GlobalSearchConfigService {
      getGlobalSearchConfig() {
        return null;
      }
    }

    class CustomAppSwitcherConfigService implements AppSwitcherConfigService {
      getAppSwitcher(luigiNodes: LuigiNode[]) {
        throw new Error('Method not implemented.');
      }
    }

    class CustomLuigiExtendedGlobalContextConfigService
      implements LuigiExtendedGlobalContextConfigService
    {
      createLuigiExtendedGlobalContext(): Promise<Record<string, any>> {
        throw new Error('Method not implemented.');
      }
    }

    class CustomCustomGlobalNodesService implements CustomGlobalNodesService {
      getCustomGlobalNodes(): Promise<LuigiNode[]> {
        throw new Error('Method not implemented.');
      }
    }

    class CustomUserProfileConfigService implements UserProfileConfigService {
      getProfile(): Promise<services.UserProfile> {
        throw new Error('Method not implemented.');
      }
    }

    class CustomLuigiBreadcrumbConfigService
      implements LuigiBreadcrumbConfigService
    {
      getBreadcrumbsConfig(): Promise<LuigiBreadcrumb> {
        throw new Error('Method not implemented.');
      }
    }

      class StaticSettingsConfigServiceImpl
          implements StaticSettingsConfigService
      {
          getStaticSettingsConfig(): Promise<services.LuigiStaticSettings> {
              throw new Error('Method not implemented.');
          }
      }

    const options: PortalOptions = {
      luigiAuthEventsCallbacksService: CustomAuthEventsService,
      staticSettingsConfigService: StaticSettingsConfigServiceImpl,
      nodeAccessHandlingService: CustomNodeAccessService,
      nodeChangeHookConfigService: CustomNodeChangeHookService,
      globalSearchConfigService: CustomGlobalSearchConfigService,
      appSwitcherConfigService: CustomAppSwitcherConfigService,
      luigiExtendedGlobalContextConfigService:
        CustomLuigiExtendedGlobalContextConfigService,
      customGlobalNodesService: CustomCustomGlobalNodesService,
      userProfileConfigService: CustomUserProfileConfigService,
      luigiBreadcrumbConfigService: CustomLuigiBreadcrumbConfigService,
      errorComponentConfig: { '404': {} } as any,
      themingService: CustomThemingService,
    };

    providePortal(options);

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    expect(providersArg).toContainEqual({
      provide: tokens.ERROR_COMPONENT_CONFIG,
      useValue: { '404': {} },
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: StaticSettingsConfigServiceImpl,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: CustomLuigiBreadcrumbConfigService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: CustomUserProfileConfigService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
      useClass: CustomCustomGlobalNodesService,
    });

    expect(providersArg).toContainEqual({
      provide:
        tokens.LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: CustomLuigiExtendedGlobalContextConfigService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: CustomAppSwitcherConfigService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.THEMING_SERVICE,
      useClass: CustomThemingService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: CustomGlobalSearchConfigService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
      useClass: CustomAuthEventsService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
      useClass: CustomNodeAccessService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass: CustomNodeChangeHookService,
    });
  });

  it('should include core Angular providers', () => {
    providePortal({});

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    expect(providersArg).toContainEqual(http.provideHttpClient());
    expect(providersArg).toContainEqual(
      core.provideZoneChangeDetection({ eventCoalescing: true })
    );
  });
});

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
    const options: PortalOptions = {
      luigiAuthEventsCallbacksService: {} as any,
      staticSettingsConfigService: {} as any,
      nodeAccessHandlingService: {} as any,
      nodeChangeHookConfigService: {} as any,
      globalSearchConfigService: {} as any,
      appSwitcherConfigService: {} as any,
      luigiExtendedGlobalContextConfigService: {} as any,
      customGlobalNodesService: {} as any,
      userProfileConfigService: {} as any,
      luigiBreadcrumbConfigService: {} as any,
      themingService: {} as any,
      errorComponentConfig: { '404': {} } as any,
    };

    providePortal(options);

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    expect(providersArg).toContainEqual({
      provide: tokens.ERROR_COMPONENT_CONFIG,
      useValue: { '404': {} },
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide:
        tokens.LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.THEMING_SERVICE,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass: {},
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

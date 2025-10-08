import * as tokens from './injection-tokens';
import { PortalOptions, providePortal } from './portal-providers';
import { CustomMessageListener } from './services';
import * as http from '@angular/common/http';
import * as core from '@angular/core';

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
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
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
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
    );

    expect(customListenerProviders).toHaveLength(0);
  });

  it('should set custom services when provided', () => {
    const options: PortalOptions = {
      luigiAuthEventsCallbacksService: {} as any,
      staticSettingsConfigService: {} as any,
      customNodeProcessingService: {} as any,
      nodeChangeHookConfigService: {} as any,
      globalSearchConfigService: {} as any,
      appSwitcherConfigService: {} as any,
      luigiExtendedGlobalContextConfigService: {} as any,
      customGlobalNodesService: {} as any,
      userProfileConfigService: {} as any,
      themingService: {} as any,
      errorComponentConfig: { '404': {} } as any,
      localConfigurationService: {} as any,
      nodeContextProcessingService: {} as any,
      headerBarConfigService: {} as any,
    };

    providePortal(options);

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    expect(providersArg).toContainEqual({
      provide:
        tokens.LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide:
        tokens.LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.ERROR_COMPONENT_CONFIG,
      useValue: { '404': {} },
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
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
      provide: tokens.LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });

    expect(providersArg).toContainEqual({
      provide: tokens.HEADER_BAR_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: {},
    });
  });

  it('should include core Angular providers', () => {
    providePortal({});

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

    expect(providersArg).toContainEqual(http.provideHttpClient());
    expect(providersArg).toContainEqual(
      core.provideZoneChangeDetection({ eventCoalescing: true }),
    );
  });
});

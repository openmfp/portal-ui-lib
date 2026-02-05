import * as tokens from './injection-tokens';
import { PortalOptions, providePortal } from './portal-providers';
import { CustomMessageListener } from './services';
import * as http from '@angular/common/http';

class MockCustomListener1 implements CustomMessageListener {
  messageId(): string {
    return 'MockCustomListener1';
  }
  onCustomMessageReceived = vi.fn();
}

class MockCustomListener2 implements CustomMessageListener {
  messageId(): string {
    return 'MockCustomListener2';
  }
  onCustomMessageReceived = vi.fn();
}

describe('Provide Portal', () => {
  const readProviders = (options?: PortalOptions) =>
    (providePortal(options) as any).ɵproviders as any[];

  it('should register custom message listeners when provided', () => {
    const providers = readProviders({
      customMessageListeners: [MockCustomListener1, MockCustomListener2],
    });

    const customListenerProviders = providers.filter(
      (provider: any) =>
        provider?.provide ===
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
    );

    expect(customListenerProviders).toHaveLength(2);
    expect(customListenerProviders).toEqual([
      {
        provide: tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
        useClass: MockCustomListener1,
        multi: true,
      },
      {
        provide: tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
        useClass: MockCustomListener2,
        multi: true,
      },
    ]);
  });

  it('should omit custom message listeners when not provided', () => {
    const providers = readProviders();

    const customListenerProviders = providers.filter(
      (provider: any) =>
        provider?.provide ===
        tokens.LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
    );

    expect(customListenerProviders).toHaveLength(0);
  });

  it('should register custom services when provided', () => {
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

    const providersArg = readProviders(options);

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

  it('should include http providers only', () => {
    const providers = readProviders();

    const httpProviders = providers.find(
      (provider: any) =>
        Array.isArray(provider?.ɵproviders) &&
        provider.ɵproviders.includes(http.HttpClient),
    );

    expect(httpProviders).toBeDefined();
  });
});

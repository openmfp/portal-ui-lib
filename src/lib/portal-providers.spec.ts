import { providePortal, PortalOptions } from './portal-providers';
import * as core from '@angular/core';
import * as http from '@angular/common/http';
import * as tokens from './injection-tokens';
import {
  CustomMessageListener,
  LuigiAuthEventsCallbacksService,
  NodeAccessHandlingService,
  NodeChangeHookConfigService,
} from './services';
import * as services from './services';
import { Context } from '@luigi-project/client';
import { LuigiNode, PortalConfig, ClientEnvironment } from './models';

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
      provide: tokens.LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
      useClass: services.NoopLuigiAuthEventsCallbacksService,
    });

    expect(providersArg).toContainEqual({
      provide: tokens.LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
      useClass: services.NoopNodeAccessHandlingService,
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
      nodeAccessHandling(
        ctx: Context,
        node: LuigiNode,
        portalConfig: PortalConfig,
        clientEnvironment: ClientEnvironment
      ): LuigiNode {
        throw new Error('Method not implemented.');
      }
    }
    class CustomNodeChangeHookService implements NodeChangeHookConfigService {
      nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode) {
        throw new Error('Method not implemented.');
      }
    }

    const options: PortalOptions = {
      luigiAuthEventsCallbacksService: CustomAuthEventsService,
      nodeAccessHandlingService: CustomNodeAccessService,
      nodeChangeHookConfigService: CustomNodeChangeHookService,
    };

    providePortal(options);

    const providersArg = mockMakeEnvironmentProviders.mock.calls[0][0];

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

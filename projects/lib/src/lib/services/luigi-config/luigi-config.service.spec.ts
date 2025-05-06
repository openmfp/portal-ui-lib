import { ClientEnvironment } from '../../models';
import { EnvConfigService } from '../portal';
import { AuthConfigService } from './auth-config.service';
import { CustomMessageListenersService } from './custom-message-listeners.service';
import { LifecycleHooksConfigService } from './lifecycle-hooks-config.service';
import { LuigiConfigService } from './luigi-config.service';
import { RoutingConfigService } from './routing-config.service';
import {
  StaticSettingsConfigService,
  StaticSettingsConfigServiceImpl,
} from './static-settings-config.service';
import { TestBed } from '@angular/core/testing';

describe('LuigiConfigService', () => {
  let service: LuigiConfigService;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let authConfigServiceMock: jest.Mocked<AuthConfigService>;
  let staticSettingsConfigServiceMock: jest.Mocked<StaticSettingsConfigService>;
  let customMessageListenersMock: jest.Mocked<CustomMessageListenersService>;
  let routingConfigServiceMock: jest.Mocked<RoutingConfigService>;
  let lifecycleHooksConfigServiceMock: jest.Mocked<LifecycleHooksConfigService>;

  beforeEach(() => {
    envConfigServiceMock = {
      getEnvConfig: jest.fn(),
    } as any;

    authConfigServiceMock = {
      getAuthConfig: jest.fn(),
    } as any;

    staticSettingsConfigServiceMock = {
      getStaticSettingsConfig: jest.fn(),
    } as any;

    customMessageListenersMock = {
      getMessageListeners: jest.fn(),
    } as any;

    routingConfigServiceMock = {
      getInitialRoutingConfig: jest.fn(),
      getRoutingConfig: jest.fn(),
    } as any;

    lifecycleHooksConfigServiceMock = {
      getLifecycleHooksConfig: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        LuigiConfigService,
        { provide: EnvConfigService, useValue: envConfigServiceMock },
        { provide: AuthConfigService, useValue: authConfigServiceMock },
        {
          provide: CustomMessageListenersService,
          useValue: customMessageListenersMock,
        },
        { provide: RoutingConfigService, useValue: routingConfigServiceMock },
        {
          provide: LifecycleHooksConfigService,
          useValue: lifecycleHooksConfigServiceMock,
        },
        {
          provide: StaticSettingsConfigServiceImpl,
          useValue: staticSettingsConfigServiceMock,
        },
      ],
    });

    service = TestBed.inject(LuigiConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLuigiConfiguration', () => {
    it('should return the correct configuration', async () => {
      // Arrange
      const mockEnvConfig: ClientEnvironment = {
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'test-client-id',
        baseDomain: 'test-base-domain',
      } as ClientEnvironment;

      const mockAuthConfig = {
        use: 'oAuth2AuthCode',
      } as any;

      const mockStaticSettings = {
        header: {
          title: 'title',
          logo: 'https://example.com/oauth',
        },
        filed: 'filed',
      };

      const mockCommunicationConfig = {
        customMessagesListeners: { 'id-43545': () => {} },
      };

      const mockLifecycleHooks = {
        luigiAfterInit: null,
      };

      const mockRoutingConfig = {
        useHashRouting: false,
        showModalPathInUrl: false,
        modalPathParam: 'modalPathParamDisabled',
        skipRoutingForUrlPatterns: [/.*/],
      };

      envConfigServiceMock.getEnvConfig.mockResolvedValue(mockEnvConfig);
      authConfigServiceMock.getAuthConfig.mockReturnValue(mockAuthConfig);
      lifecycleHooksConfigServiceMock.getLifecycleHooksConfig.mockReturnValue(
        mockLifecycleHooks,
      );
      staticSettingsConfigServiceMock.getStaticSettingsConfig.mockResolvedValue(
        mockStaticSettings,
      );
      customMessageListenersMock.getMessageListeners.mockReturnValue(
        mockCommunicationConfig,
      );
      routingConfigServiceMock.getInitialRoutingConfig.mockReturnValue(
        mockRoutingConfig,
      );

      // Act
      const config = await service.getLuigiConfiguration();

      // Assert
      expect(envConfigServiceMock.getEnvConfig).toHaveBeenCalled();
      expect(
        staticSettingsConfigServiceMock.getStaticSettingsConfig,
      ).toHaveBeenCalled();
      expect(authConfigServiceMock.getAuthConfig).toHaveBeenCalledWith(
        mockEnvConfig,
      );

      expect(config).toEqual({
        auth: mockAuthConfig,
        routing: mockRoutingConfig,
        settings: mockStaticSettings,
        communication: mockCommunicationConfig,
        lifecycleHooks: mockLifecycleHooks,
      });
    });
  });
});

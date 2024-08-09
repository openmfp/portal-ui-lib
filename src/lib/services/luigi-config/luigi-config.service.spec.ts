import { LuigiConfigService } from './luigi-config.service';
import { EnvConfigService } from '../portal/env-config.service';
import { AuthConfigService } from './auth-config.service';
import { ClientEnvironment } from '../../model/env';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';
import { CustomMessageListenersService } from './custom-message-listeners.service';

describe('LuigiConfigService', () => {
  let service: LuigiConfigService;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let authConfigServiceMock: jest.Mocked<AuthConfigService>;
  let staticSettingsConfigServiceMock: jest.Mocked<StaticSettingsConfigService>;
  let customMessageListenersMock: jest.Mocked<CustomMessageListenersService>;
  let routingConfigServiceMock: jest.Mocked<RoutingConfigService>;

  beforeEach(() => {
    envConfigServiceMock = {
      getEnvConfig: jest.fn(),
    } as any;

    authConfigServiceMock = {
      getAuthConfig: jest.fn(),
    } as any;

    staticSettingsConfigServiceMock = {
      getInitialStaticSettingsConfig: jest.fn(),
    } as any;

    customMessageListenersMock = {
      getMessageListeners: jest.fn(),
    } as any;

    routingConfigServiceMock = {
      getInitialRoutingConfig: jest.fn(),
      getRoutingConfig: jest.fn(),
    } as any;

    service = new LuigiConfigService(
      envConfigServiceMock,
      authConfigServiceMock,
      customMessageListenersMock,
      routingConfigServiceMock,
      staticSettingsConfigServiceMock
    );
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
      } as ClientEnvironment;

      const mockAuthConfig = {
        use: 'oAuth2AuthCode',
      } as any;

      const mockStaticSettings = {
        filed: 'filed',
      };

      const mockCommunicationConfig = {
        customMessagesListeners: { 'id-43545': () => {} },
      };

      const mockRoutingConfig = {
        useHashRouting: false,
        showModalPathInUrl: false,
        modalPathParam: 'modalPathParamDisabled',
        skipRoutingForUrlPatterns: [/.*/],
      };

      envConfigServiceMock.getEnvConfig.mockResolvedValue(mockEnvConfig);
      authConfigServiceMock.getAuthConfig.mockReturnValue(mockAuthConfig);
      staticSettingsConfigServiceMock.getInitialStaticSettingsConfig.mockReturnValue(
        mockStaticSettings
      );
      jest
        .spyOn(customMessageListenersMock, 'getMessageListeners')
        .mockReturnValue(mockCommunicationConfig);
      routingConfigServiceMock.getInitialRoutingConfig.mockReturnValue(
        mockRoutingConfig
      );

      // Act
      const config = await service.getLuigiConfiguration();

      // Assert
      expect(envConfigServiceMock.getEnvConfig).toHaveBeenCalled();
      expect(
        staticSettingsConfigServiceMock.getInitialStaticSettingsConfig
      ).toHaveBeenCalled();
      expect(authConfigServiceMock.getAuthConfig).toHaveBeenCalledWith(
        mockEnvConfig.oauthServerUrl,
        mockEnvConfig.clientId
      );

      expect(config).toEqual({
        auth: mockAuthConfig,
        routing: mockRoutingConfig,
        settings: mockStaticSettings,
        communication: mockCommunicationConfig,
      });
    });
  });
});

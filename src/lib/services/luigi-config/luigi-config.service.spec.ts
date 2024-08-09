import { LuigiConfigService } from './luigi-config.service';
import { EnvConfigService } from '../env-config.service';
import { AuthConfigService } from './auth-config.service';
import { ClientEnvironment } from '../../model/env';
import { StaticSettingsConfigService } from './static-settings-config.service';

describe('LuigiConfigService', () => {
  let service: LuigiConfigService;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let authConfigServiceMock: jest.Mocked<AuthConfigService>;
  let staticSettingsConfigServiceMock: jest.Mocked<StaticSettingsConfigService>;

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

    service = new LuigiConfigService(
      envConfigServiceMock,
      authConfigServiceMock,
      staticSettingsConfigServiceMock
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLuigiConfiguration', () => {
    it('should return the correct configuration', async () => {
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

      envConfigServiceMock.getEnvConfig.mockResolvedValue(mockEnvConfig);
      authConfigServiceMock.getAuthConfig.mockReturnValue(mockAuthConfig);
      staticSettingsConfigServiceMock.getInitialStaticSettingsConfig.mockReturnValue(
        mockStaticSettings
      );

      const config = await service.getLuigiConfiguration();

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
        routing: expect.any(Object),
        settings: mockStaticSettings,
      });

      // Check routing config
      expect(config.routing).toEqual({
        useHashRouting: false,
        showModalPathInUrl: false,
        modalPathParam: 'modalPathParamDisabled',
        skipRoutingForUrlPatterns: [/.*/],
        pageNotFoundHandler: expect.any(Function),
      });
    });
  });

  describe('getRoutingConfig', () => {
    it('should return the correct routing configuration', () => {
      const routingConfig = (service as any).getRoutingConfig();

      expect(routingConfig).toEqual({
        useHashRouting: false,
        showModalPathInUrl: false,
        modalPathParam: 'modalPathParamDisabled',
        skipRoutingForUrlPatterns: [/.*/],
        pageNotFoundHandler: expect.any(Function),
      });
    });
  });
});

import { LuigiConfigService } from './luigi-config.service';
import { EnvConfigService } from '../env-config.service';
import { AuthConfigService } from './auth-config.service';
import { ClientEnvironment } from '../../model/env';

describe('LuigiConfigService', () => {
  let service: LuigiConfigService;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let authConfigServiceMock: jest.Mocked<AuthConfigService>;

  beforeEach(() => {
    envConfigServiceMock = {
      getEnvConfig: jest.fn(),
    } as any;

    authConfigServiceMock = {
      getAuthConfig: jest.fn(),
    } as any;

    service = new LuigiConfigService(
      envConfigServiceMock,
      authConfigServiceMock
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

      envConfigServiceMock.getEnvConfig.mockResolvedValue(mockEnvConfig);
      authConfigServiceMock.getAuthConfig.mockReturnValue(mockAuthConfig);

      const config = await service.getLuigiConfiguration();

      expect(envConfigServiceMock.getEnvConfig).toHaveBeenCalled();
      expect(authConfigServiceMock.getAuthConfig).toHaveBeenCalledWith(
        mockEnvConfig.oauthServerUrl,
        mockEnvConfig.clientId
      );

      expect(config).toEqual({
        auth: mockAuthConfig,
        routing: expect.any(Object),
        settings: expect.any(Object),
      });

      // Check routing config
      expect(config.routing).toEqual({
        useHashRouting: false,
        showModalPathInUrl: false,
        modalPathParam: 'modalPathParamDisabled',
        skipRoutingForUrlPatterns: [/.*/],
        pageNotFoundHandler: expect.any(Function),
      });

      // Check settings config
      expect(config.settings).toEqual({
        header: {
          title: 'OpenMFP Portal',
          logo: expect.any(String),
          favicon: expect.any(String),
        },
        experimental: {
          btpToolLayout: true,
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3',
        featureToggles: {
          queryStringParam: 'ft',
        },
        appLoadingIndicator: {
          hideAutomatically: true,
        },
      });
    });
  });

  describe('getStaticSettingsConfig', () => {
    it('should return the correct static settings', () => {
      const settings = (service as any).getStaticSettingsConfig();

      expect(settings).toEqual({
        header: {
          title: 'OpenMFP Portal',
          logo: expect.any(String),
          favicon: expect.any(String),
        },
        experimental: {
          btpToolLayout: true,
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3',
        featureToggles: {
          queryStringParam: 'ft',
        },
        appLoadingIndicator: {
          hideAutomatically: true,
        },
      });

      // Check that logo and favicon are blank images
      const blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAAC';
      expect(settings.header.logo).toBe(blankImg);
      expect(settings.header.favicon).toBe(blankImg);
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

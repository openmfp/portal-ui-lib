import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';
import { LuigiCoreService } from '../luigi-core.service';

describe('StaticSettingsConfigServiceImpl', () => {
  let service: StaticSettingsConfigServiceImpl;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    luigiCoreServiceMock = {
      isFeatureToggleActive: jest.fn(),
    } as unknown as jest.Mocked<LuigiCoreService>;

    service = new StaticSettingsConfigServiceImpl(luigiCoreServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInitialStaticSettingsConfig', () => {
    it('should return the correct configuration with MFP logo when feature toggle is active', () => {
      luigiCoreServiceMock.isFeatureToggleActive.mockReturnValue(true);

      const config = service.getInitialStaticSettingsConfig();

      expect(config).toEqual({
        header: {
          title: 'OpenMFP Portal',
          logo: 'assets/mfp_mark.svg',
          favicon: 'assets/mfp_mark.svg',
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

      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledWith(
        'mfp-logo'
      );
    });

    it('should return the correct configuration with ORA logo when feature toggle is inactive', () => {
      luigiCoreServiceMock.isFeatureToggleActive.mockReturnValue(false);

      const config = service.getInitialStaticSettingsConfig();

      expect(config.header.logo).toBe('assets/ora-mark.svg');
      expect(config.header.favicon).toBe('assets/ora-mark.svg');

      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledWith(
        'mfp-logo'
      );
    });
  });

  describe('getStaticSettingsConfig', () => {
    it('should return the same configuration as getInitialStaticSettingsConfig', () => {
      const initialConfig = service.getInitialStaticSettingsConfig();
      const staticConfig = service.getStaticSettingsConfig();
      expect(staticConfig).toEqual(initialConfig);
    });
  });
});

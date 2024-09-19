import { mfpMarkSvg } from '../../data/mfp-mark';
import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';
import { LuigiCoreService } from '../luigi-core.service';

describe('StaticSettingsConfigServiceImpl', () => {
  let service: StaticSettingsConfigServiceImpl;

  beforeEach(() => {
    service = new StaticSettingsConfigServiceImpl();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInitialStaticSettingsConfig', () => {
    it('should return the correct configuration with MFP logo', () => {
      const config = service.getInitialStaticSettingsConfig();

      expect(config).toEqual({
        header: {
          title: 'OpenMFP Portal',
          logo: mfpMarkSvg,
          favicon: mfpMarkSvg,
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
    it('should return the same configuration as getInitialStaticSettingsConfig', () => {
      const initialConfig = service.getInitialStaticSettingsConfig();
      const staticConfig = service.getStaticSettingsConfig();
      expect(staticConfig).toEqual(initialConfig);
    });
  });
});

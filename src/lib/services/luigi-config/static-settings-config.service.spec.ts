import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';

describe('StaticSettingsConfigServiceImpl', () => {
  let service: StaticSettingsConfigServiceImpl;

  beforeEach(() => {
    service = new StaticSettingsConfigServiceImpl();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInitialStaticSettingsConfig', () => {
    it('should return the correct initial configuration', () => {
      const config = service.getInitialStaticSettingsConfig();
      const blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAAC';

      expect(config).toEqual({
        header: {
          title: 'OpenMFP Portal',
          logo: blankImg,
          favicon: blankImg,
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

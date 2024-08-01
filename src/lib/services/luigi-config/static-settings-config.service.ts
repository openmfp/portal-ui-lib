export interface StaticSettingsConfigService {
  getInitialStaticSettingsConfig(): Record<string, any>;
  getStaticSettingsConfig(): Record<string, any>;
}

export class StaticSettingsConfigServiceImpl
  implements StaticSettingsConfigService
{
  constructor() {}

  getInitialStaticSettingsConfig() {
    const blankImg = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAAC';

    return {
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
    };
  }

  getStaticSettingsConfig() {
    return this.getInitialStaticSettingsConfig();
  }
}

import { Injectable } from '@angular/core';
import { mfpMarkSvg } from '../../data';

export interface StaticSettingsConfigService {
  getInitialStaticSettingsConfig(): Record<string, any>;
  getStaticSettingsConfig(): Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class StaticSettingsConfigServiceImpl
  implements StaticSettingsConfigService
{
  constructor() {}

  getInitialStaticSettingsConfig() {
    const logo = mfpMarkSvg;

    return {
      header: {
        title: 'OpenMFP Portal',
        logo: logo,
        favicon: logo,
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

import { Injectable } from '@angular/core';
import { LuigiCoreService } from '../luigi-core.service';

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
  constructor(private luigiCoreService: LuigiCoreService) {}

  getInitialStaticSettingsConfig() {
    const logo = this.luigiCoreService.isFeatureToggleActive('mfp-logo')
      ? 'assets/mfp_mark.svg'
      : 'assets/ora-mark.svg';

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

import { inject, Injectable } from '@angular/core';
import { I18nService } from '../i18n.service';
import { IframeService } from './iframe.service';

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
  private i18nService = inject(I18nService);
  private iframeService = inject(IframeService);

  getInitialStaticSettingsConfig() {
    const logo = 'assets/images/mfp_mark.svg';

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
      iframeCreationInterceptor: this.iframeService.iFrameCreationInterceptor(),
      customTranslationImplementation: this.i18nService,
    };
  }

  getStaticSettingsConfig() {
    return this.getInitialStaticSettingsConfig();
  }
}

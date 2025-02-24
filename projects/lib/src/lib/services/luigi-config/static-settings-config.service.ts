import { inject, Injectable } from '@angular/core';
import { LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiStaticSettings } from '../../models';
import { I18nService } from '../i18n.service';
import { IframeService } from './iframe.service';

export interface StaticSettingsConfigService {
  getStaticSettingsConfig(): Promise<LuigiStaticSettings>;
}

@Injectable({
  providedIn: 'root',
})
export class StaticSettingsConfigServiceImpl
  implements StaticSettingsConfigService
{
  private customStaticSettingsConfigService =
    inject<StaticSettingsConfigService>(
      LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN as any,
      {
        optional: true,
      }
    );
  private i18nService = inject(I18nService);
  private iframeService = inject(IframeService);

  async getStaticSettingsConfig(): Promise<LuigiStaticSettings> {
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
      ...(await this.customStaticSettingsConfigService?.getStaticSettingsConfig()),
    };
  }
}

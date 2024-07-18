import { Injectable } from '@angular/core';
import { ClientEnvironment } from '../../model/env';
import { AuthConfigService } from './auth-config.service';
import { EnvConfigService } from '../env-config.service';

@Injectable({
  providedIn: 'root',
})
export class LuigiConfigService {
  constructor(
    private envConfigService: EnvConfigService,
    private authConfigService: AuthConfigService
  ) {}

  public async getLuigiConfiguration() {
    const envConfig: ClientEnvironment =
      await this.envConfigService.getEnvConfig();
    const config = {
      auth: this.authConfigService.getAuthConfig(
        envConfig.oauthServerUrl,
        envConfig.clientId
      ),
      routing: this.getRoutingConfig() as any,
      settings: this.getStaticSettingsConfig(),
    };
    return config;
  }

  private getStaticSettingsConfig() {
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
    };
  }

  private getRoutingConfig() {
    return {
      useHashRouting: false,
      showModalPathInUrl: false,
      modalPathParam: 'modalPathParamDisabled',
      skipRoutingForUrlPatterns: [/.*/],
      pageNotFoundHandler: () => {},
    };
  }
}

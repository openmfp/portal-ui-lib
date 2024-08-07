import { Inject, Injectable } from '@angular/core';
import {
  LUIGI_COMMUNICATION_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { ClientEnvironment } from '../../model/env';
import { AuthConfigService } from './auth-config.service';
import { EnvConfigService } from '../portal/env-config.service';
import { CommunicationConfigService } from './communication-config.service';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';

@Injectable({
  providedIn: 'root',
})
export class LuigiConfigService {
  constructor(
    private envConfigService: EnvConfigService,
    private authConfigService: AuthConfigService,
    private routingConfigService: RoutingConfigService,
    @Inject(LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN)
    private staticSettingsConfigService: StaticSettingsConfigService,
    @Inject(LUIGI_COMMUNICATION_CONFIG_SERVICE_INJECTION_TOKEN)
    private communicationConfigService: CommunicationConfigService
  ) {}

  public async getLuigiConfiguration() {
    const envConfig: ClientEnvironment =
      await this.envConfigService.getEnvConfig();
    return {
      auth: this.authConfigService.getAuthConfig(
        envConfig.oauthServerUrl,
        envConfig.clientId
      ),
      routing: this.routingConfigService.getInitialRoutingConfig(),
      communication: this.communicationConfigService.getCommunicationConfig(),
      settings:
        this.staticSettingsConfigService.getInitialStaticSettingsConfig(),
    };
  }
}

import { Inject, Injectable } from '@angular/core';
import { LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { ClientEnvironment } from '../../models';
import { AuthConfigService } from './auth-config.service';
import { EnvConfigService } from '../portal';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';
import { CustomMessageListenersService } from './custom-message-listeners.service';
import { LifecycleHooksConfigService } from './lifecycle-hooks-config.service';

@Injectable({
  providedIn: 'root',
})
export class LuigiConfigService {
  constructor(
    private envConfigService: EnvConfigService,
    private authConfigService: AuthConfigService,
    private customMessageListenersService: CustomMessageListenersService,
    private routingConfigService: RoutingConfigService,
    private lifecycleHooksConfigService: LifecycleHooksConfigService,
    @Inject(LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN)
    private staticSettingsConfigService: StaticSettingsConfigService
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
      communication: this.customMessageListenersService.getMessageListeners(),
      settings:
        this.staticSettingsConfigService.getInitialStaticSettingsConfig(),
      lifecycleHooks:
        this.lifecycleHooksConfigService.getLifecycleHooksConfig(envConfig),
    };
  }
}

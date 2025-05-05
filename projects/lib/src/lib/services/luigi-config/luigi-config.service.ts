import { ClientEnvironment, LuigiConfig } from '../../models';
import { EnvConfigService } from '../portal';
import { AuthConfigService } from './auth-config.service';
import { CustomMessageListenersService } from './custom-message-listeners.service';
import { LifecycleHooksConfigService } from './lifecycle-hooks-config.service';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LuigiConfigService {
  private envConfigService = inject(EnvConfigService);
  private authConfigService = inject(AuthConfigService);
  private customMessageListenersService = inject(CustomMessageListenersService);
  private routingConfigService = inject(RoutingConfigService);
  private lifecycleHooksConfigService = inject(LifecycleHooksConfigService);
  private staticSettingsConfigService = inject(StaticSettingsConfigServiceImpl);

  public async getLuigiConfiguration(): Promise<LuigiConfig> {
    const envConfig: ClientEnvironment =
      await this.envConfigService.getEnvConfig();
    return {
      auth: this.authConfigService.getAuthConfig(envConfig),
      routing: this.routingConfigService.getInitialRoutingConfig(),
      communication: this.customMessageListenersService.getMessageListeners(),
      settings:
        await this.staticSettingsConfigService.getStaticSettingsConfig(),
      lifecycleHooks:
        this.lifecycleHooksConfigService.getLifecycleHooksConfig(envConfig),
    };
  }
}

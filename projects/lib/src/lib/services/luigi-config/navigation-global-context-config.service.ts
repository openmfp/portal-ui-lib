import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiGlobalContext } from '../../models';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { AuthService, ConfigService, EnvConfigService } from '../portal';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationGlobalContextConfigService {
  private authService = inject(AuthService);
  private configService = inject(ConfigService);
  private envConfigService = inject(EnvConfigService);
  private luigiExtendedGlobalContextConfigService =
    inject<LuigiExtendedGlobalContextConfigService>(
      LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN as any,
      { optional: true },
    );

  async getGlobalContext(): Promise<LuigiGlobalContext> {
    const portalConfig = await this.configService.getPortalConfig();
    const userInfo = this.authService.getUserInfo();
    const envConfig = await this.envConfigService.getEnvConfig();
    return {
      ...(await this.luigiExtendedGlobalContextConfigService?.createLuigiExtendedGlobalContext()),
      portalBaseUrl: window.location.origin,
      portalContext: portalConfig.portalContext,
      userId: userInfo.userId,
      userEmail: userInfo.email,
      token: this.authService.getToken(),
      organization: envConfig.organization,
    };
  }
}

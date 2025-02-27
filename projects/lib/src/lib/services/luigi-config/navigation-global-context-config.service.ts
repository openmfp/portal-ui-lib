import { Inject, Injectable, Optional, inject } from '@angular/core';
import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiGlobalContext } from '../../models';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { AuthService, ConfigService } from '../portal';

@Injectable({ providedIn: 'root' })
export class NavigationGlobalContextConfigService {
  private authService = inject(AuthService);
  private configService = inject(ConfigService);
  private luigiExtendedGlobalContextConfigService =
    inject<LuigiExtendedGlobalContextConfigService>(
      LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN as any,
      { optional: true }
    );

  async getGlobalContext(): Promise<LuigiGlobalContext> {
    const portalConfig = await this.configService.getPortalConfig();
    const userInfo = this.authService.getUserInfo();
    return {
      ...(await this.luigiExtendedGlobalContextConfigService?.createLuigiExtendedGlobalContext()),
      portalContext: portalConfig.portalContext,
      userId: userInfo.userId,
      userEmail: userInfo.email,
      token: this.authService.getToken(),
    };
  }
}

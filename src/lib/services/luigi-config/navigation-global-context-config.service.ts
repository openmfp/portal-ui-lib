import { Inject, Injectable, Optional } from '@angular/core';
import { LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiGlobalContext } from '../../models';
import { LuigiExtendedGlobalContextConfigService } from '../luigi-nodes/luigi-extended-global-context-config.service';
import { AuthService, ConfigService } from '../portal';

@Injectable({ providedIn: 'root' })
export class NavigationGlobalContextConfigService {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    @Optional()
    @Inject(LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN)
    private luigiExtendedGlobalContextConfigService: LuigiExtendedGlobalContextConfigService
  ) {}

  async getGlobalContext(): Promise<LuigiGlobalContext> {
    const portalConfig = await this.configService.getPortalConfig();

    return {
      ...(await this.luigiExtendedGlobalContextConfigService?.createLuigiExtendedGlobalContext()),
      portalContext: portalConfig.portalContext,
      userId: this.authService.getUsername(),
      userEmail: this.authService.getUserEmail(),
      token: this.authService.getToken(),
    };
  }
}

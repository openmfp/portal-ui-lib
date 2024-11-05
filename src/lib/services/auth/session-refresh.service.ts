import { Inject, Injectable } from '@angular/core';
import { LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { AuthEvent } from '../../models';
import { NavigationGlobalContextConfigService } from '../luigi-config/navigation-global-context-config.service';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthService } from '../portal';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  constructor(
    private authService: AuthService,
    private luigiCoreService: LuigiCoreService,
    @Inject(LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN)
    private navigationGlobalContextConfigService: NavigationGlobalContextConfigService
  ) {}

  async refresh() {
    const isRefreshed = await this.authService.refresh();

    if (!isRefreshed) {
      return;
    }

    this.authService.authEvent(AuthEvent.AUTH_REFRESHED);
    this.luigiCoreService.setAuthData(this.authService.getAuthData());
    this.luigiCoreService.setGlobalContext(
      this.navigationGlobalContextConfigService.getGlobalContext(),
      true
    );
    // Luigi executes the TokenExpireSoon only once and afterwards removes an interval which checks expiration.
    // We need to bring it back with the below call in order to be able to receive next TokenExpireSoon event.
    // Once the matter is adjusted on Luigi we can remove the below code.
    (window as any).IDP.setTokenExpireSoonAction();
  }
}

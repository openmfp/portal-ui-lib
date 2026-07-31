import { AuthEvent } from '../../models';
import { GlobalContextConfigService } from '../luigi-config/global-context-config.service';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthService } from '../portal';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  constructor(
    private authService: AuthService,
    private luigiCoreService: LuigiCoreService,
    private navigationGlobalContextConfigService: GlobalContextConfigService,
  ) {}

  async refresh() {
    const isRefreshed = await this.authService.refresh();

    if (!isRefreshed) {
      // An empty refresh response means the server could not renew the session
      // (the SSO session hit its idle timeout or absolute lifetime). Keeping the
      // stale auth data leaves every later request carrying a dead token, which
      // surfaces as unexplained 401s until the user reloads by hand. Signal the
      // expiry - the redirect target is stored by the AUTH_EXPIRED subscriber -
      // and drop the auth data so the frame re-authenticates.
      this.authService.authEvent(AuthEvent.AUTH_EXPIRED);
      this.luigiCoreService.removeAuthData();
      return;
    }

    this.authService.authEvent(AuthEvent.AUTH_REFRESHED);
    this.luigiCoreService.setAuthData(this.authService.getAuthData());
    this.luigiCoreService.setGlobalContext(
      await this.navigationGlobalContextConfigService.getGlobalContext(),
      true,
    );
  }
}

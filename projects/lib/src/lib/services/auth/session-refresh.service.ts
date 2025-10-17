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

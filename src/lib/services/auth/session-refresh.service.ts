import { Injectable } from '@angular/core';
import { AuthEvent } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthService } from '../portal';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  constructor(
    private authService: AuthService,
    private luigiCoreService: LuigiCoreService
  ) {}

  async refresh() {
    await this.authService.refresh();
    this.authService.authEvent(AuthEvent.AUTH_REFRESHED);
    this.luigiCoreService.setAuthData(this.authService.getAuthData());
    this.luigiCoreService.resetLuigi();
  }
}

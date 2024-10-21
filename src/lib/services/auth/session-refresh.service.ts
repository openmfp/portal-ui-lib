import { Injectable } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { AuthEvent } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthService } from '../portal';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private refreshTokenSubscription: Subscription;
  constructor(
    private authService: AuthService,
    private luigiCoreService: LuigiCoreService
  ) {}

  refresh() {
    if (this.refreshTokenSubscription) {
      return;
    }

    this.refreshTokenSubscription = this.authService.authEvents
      .pipe(
        filter((event) => {
          return [AuthEvent.AUTH_EXPIRE_SOON, AuthEvent.AUTH_EXPIRED].includes(
            event
          );
        }),
        filter(() =>
          this.luigiCoreService.isFeatureToggleActive(
            'enableSessionAutoRefresh'
          )
        )
      )
      .subscribe({
        next: async () => {
          await this.authService.refresh();
          this.authService.authEvent(AuthEvent.AUTH_REFRESHED);
          this.luigiCoreService.setAuthData(this.authService.getAuthData());
          this.luigiCoreService.resetLuigi();
        },
      });
  }
}

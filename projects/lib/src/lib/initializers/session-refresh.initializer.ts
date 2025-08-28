import { AuthEvent } from '../models';
import {
  AuthService,
  LuigiCoreService,
  SessionRefreshService,
} from '../services';
import { inject, provideAppInitializer } from '@angular/core';
import { filter } from 'rxjs';

async function initializeAutomaticSessionRefresh(
  sessionRefreshService: SessionRefreshService,
  authService: AuthService,
  luigiCoreService: LuigiCoreService,
) {
  authService.authEvents
    .pipe(
      filter((event: AuthEvent) => event === AuthEvent.AUTH_EXPIRE_SOON),
      filter(() =>
        luigiCoreService.isFeatureToggleActive('enableSessionAutoRefresh'),
      ),
    )
    .subscribe({
      next: async () => {
        try {
          await sessionRefreshService.refresh();
        } catch (error) {
          console.error('Error executing session refresh: ', error);
        }
      },
    });
}

export const provideSessionRefresh = () =>
  provideAppInitializer(() => {
    initializeAutomaticSessionRefresh(
      inject(SessionRefreshService),
      inject(AuthService),
      inject(LuigiCoreService),
    );
  });

import { AuthEvent } from '../models';
import { AuthService, SessionRefreshService } from '../services';
import { inject, provideAppInitializer } from '@angular/core';
import { filter } from 'rxjs';

export async function initializeAutomaticSessionRefresh(
  sessionRefreshService: SessionRefreshService,
  authService: AuthService,
) {
  authService.authEvents
    .pipe(filter((event: AuthEvent) => event === AuthEvent.AUTH_EXPIRE_SOON))
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
  provideAppInitializer(() =>
    initializeAutomaticSessionRefresh(
      inject(SessionRefreshService),
      inject(AuthService),
    ),
  );

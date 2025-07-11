import { AuthEvent } from '../models';
import {
  AuthService,
  LuigiCoreService,
  SessionRefreshService,
} from '../services';
import { APP_INITIALIZER } from '@angular/core';
import { filter } from 'rxjs';

function initializeAutomaticSessionRefresh(
  sessionRefreshService: SessionRefreshService,
  authService: AuthService,
  luigiCoreService: LuigiCoreService,
) {
  return () => {
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
  };
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeAutomaticSessionRefresh,
  multi: true,
  deps: [SessionRefreshService, AuthService, LuigiCoreService],
};

export const provideSessionRefresh = () => provider;

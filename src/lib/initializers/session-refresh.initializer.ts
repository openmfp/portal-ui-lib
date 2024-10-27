import { APP_INITIALIZER } from '@angular/core';
import { filter } from 'rxjs';
import { AuthEvent } from '../models';
import {
  AuthService,
  LuigiCoreService,
  SessionRefreshService,
} from '../services';

function initializeAutomaticSessionRefresh(
  sessionRefreshService: SessionRefreshService,
  authService: AuthService,
  luigiCoreService: LuigiCoreService
) {
  return () => {
    authService.authEvents
      .pipe(
        filter((event: AuthEvent) => {
          return [AuthEvent.AUTH_EXPIRE_SOON, AuthEvent.AUTH_EXPIRED].includes(
            event
          );
        }),
        filter(() =>
          luigiCoreService.isFeatureToggleActive('enableSessionAutoRefresh')
        )
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

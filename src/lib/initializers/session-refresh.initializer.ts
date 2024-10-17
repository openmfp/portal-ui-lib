import { APP_INITIALIZER } from '@angular/core';
import { SessionRefreshService } from '../services/auth/session-refresh.service';

function initializeAutomaticSessionRefresh(
  sessionRefreshService: SessionRefreshService
) {
  return () => sessionRefreshService.refresh();
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeAutomaticSessionRefresh,
  multi: true,
  deps: [SessionRefreshService],
};

export const provideSessionRefresh = () => provider;

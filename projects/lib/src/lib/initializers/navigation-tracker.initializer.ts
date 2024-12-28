import { APP_INITIALIZER } from '@angular/core';
import { NavigationService } from '../services/navigation.service';

function track(navigationService: NavigationService) {
  return async () => {
    navigationService.track();
  };
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: track,
  multi: true,
  deps: [NavigationService],
};

export const provideNavigationTracker = () => provider;

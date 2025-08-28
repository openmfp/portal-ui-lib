import { NavigationService } from '../services/navigation.service';
import { inject, provideAppInitializer } from '@angular/core';

async function track(navigationService: NavigationService) {
  navigationService.track();
}

export const provideNavigationTracker = () =>
  provideAppInitializer(() => {
    track(inject(NavigationService));
  });

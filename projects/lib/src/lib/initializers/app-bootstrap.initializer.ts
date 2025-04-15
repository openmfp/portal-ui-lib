import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from '../services';

function bootstrap(authService: AuthService) {
  return async () => {
    try {
      await authService.refresh();
    } catch (error) {
      console.error('Error bootstrapping the app:', error);
    }
  };
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: bootstrap,
  multi: true,
  deps: [AuthService],
};

export const provideBootstrap = () => provider;

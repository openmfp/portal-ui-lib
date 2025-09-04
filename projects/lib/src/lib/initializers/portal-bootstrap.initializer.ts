import { AuthService } from '../services';
import { inject, provideAppInitializer } from '@angular/core';

export async function bootstrap(authService: AuthService) {
  try {
    await authService.refresh();
  } catch (error) {
    console.error('Error bootstrapping the app:', error);
  }
}

export const provideBootstrap = () =>
  provideAppInitializer(() => bootstrap(inject(AuthService)));

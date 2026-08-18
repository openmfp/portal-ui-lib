import { AuthService, EnvConfigService } from '../services';
import { inject, provideAppInitializer } from '@angular/core';

export async function bootstrap(
  authService: AuthService,
  envConfigService: EnvConfigService,
) {
  try {
    const { oauthServerUrl, clientId } = await envConfigService.getEnvConfig();

    if (!oauthServerUrl || !clientId) {
      return;
    }

    await authService.refresh();
  } catch (error) {
    console.error('Error bootstrapping the app:', error);
  }
}

export const provideBootstrap = () =>
  provideAppInitializer(() =>
    bootstrap(inject(AuthService), inject(EnvConfigService)),
  );

import { LuigiCoreService } from './luigi-core.service';
import { AuthService, ConfigService, EnvConfigService } from './portal';
import { featureToggleLocalStorage } from './storage-service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureTogglesService {
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private envConfigService = inject(EnvConfigService);
  private luigiCoreService = inject(LuigiCoreService);

  public async initFeatureToggles() {
    try {
      const { uiOptions } = await this.envConfigService.getEnvConfig();
      let ft = {};
      if (this.authService.getAuthData()) {
        const { featureToggles } = await this.configService.getPortalConfig();
        ft = featureToggles;
      }

      if (uiOptions?.includes('enableFeatureToggleSetting')) {
        const featureToggleSettings = featureToggleLocalStorage.read();
        this.luigiCoreService.setFeatureToggles({
          ...ft,
          ...featureToggleSettings,
        });
        return;
      }

      this.luigiCoreService.setFeatureToggles(ft);
    } catch (e) {
      console.error('Failed to initialize feature toggles', e);
    }
  }
}

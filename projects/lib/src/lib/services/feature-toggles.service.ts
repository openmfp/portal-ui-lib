import { LuigiCoreService } from './luigi-core.service';
import { ConfigService, EnvConfigService } from './portal';
import { featureToggleLocalStorage } from './storage-service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureTogglesService {
  private configService = inject(ConfigService);
  private envConfigService = inject(EnvConfigService);
  private luigiCoreService = inject(LuigiCoreService);

  public async initFeatureToggles() {
    try {
      const { uiOptions } = await this.envConfigService.getEnvConfig();
      const { featureToggles } = await this.configService.getPortalConfig();

      if (uiOptions?.includes('enableFeatureToggleSetting')) {
        const featureToggleSettings = featureToggleLocalStorage.read();
        this.luigiCoreService.setFeatureToggles({
          ...featureToggles,
          ...featureToggleSettings,
        });
        return;
      }

      this.luigiCoreService.setFeatureToggles(featureToggles);
    } catch (e) {
      console.error('Failed to initialize feature toggles', e);
    }
  }
}

import { LocalDevelopmentSettings } from '../../../models';
import { EnvConfigService } from '../../portal';
import { LocalDevelopmentSettingsLocalStorage } from '../../storage-service';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevModeSettingsService {
  private envConfigService = inject(EnvConfigService);

  async getDevModeSettings(): Promise<LocalDevelopmentSettings> {
    const { developmentInstance } = await this.envConfigService.getEnvConfig();

    // you can enable external configuration in production by having the localStorageSetting in local storage
    const localStorageSetting = (LocalDevelopmentSettingsLocalStorage.read() ||
      {}) as LocalDevelopmentSettings;
    const localDevelopmentSettings = {
      ...this.getDefaultLocalDevelopmentSetting(developmentInstance),
      ...localStorageSetting,
    };

    if (localDevelopmentSettings.isActive) {
      return localDevelopmentSettings;
    } else {
      return {
        isActive: false,
        configs: [],
        serviceProviderConfig: {},
      };
    }
  }

  private getDefaultLocalDevelopmentSetting(
    developmentInstance: boolean
  ): LocalDevelopmentSettings {
    return {
      isActive: developmentInstance,
      configs: [
        {
          url: 'http://localhost:4200/assets/content-configuration-global.json',
        },
        {
          url: 'http://localhost:4200/assets/content-configuration.json',
        },
      ],
      serviceProviderConfig: {},
    };
  }
}

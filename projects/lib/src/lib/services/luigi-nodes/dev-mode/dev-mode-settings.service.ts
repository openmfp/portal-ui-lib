import { EnvConfigService } from '../../portal';
import { LocalStorageKeys } from '../../storage-service';
import { DevModeSettings } from './dev-mode-settings';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevModeSettingsService {
  constructor(private envConfigService: EnvConfigService) {}

  async getDevModeSettings(): Promise<DevModeSettings> {
    const { developmentInstance } = await this.envConfigService.getEnvConfig();

    let resultingDevModeSettings = {
      isActive: developmentInstance, // in dev mode always look for external configuration
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

    let devModeSettingsString: string;
    try {
      devModeSettingsString = window.localStorage.getItem(
        LocalStorageKeys.developmentModeConfigKey
      );
    } catch (e) {
      // ignore local storage exceptions
    }

    if (devModeSettingsString) {
      try {
        resultingDevModeSettings = {
          // you can enable external configuration in production by setting isActive:true
          ...resultingDevModeSettings,
          ...JSON.parse(devModeSettingsString),
        };
      } catch (e) {
        console.error(
          `Failed to parse the dev mode settings in your localstorage because of ${e}`
        );
      }
    }

    if (!resultingDevModeSettings.isActive) {
      return {
        configs: [],
        serviceProviderConfig: {},
      };
    }

    return {
      configs: resultingDevModeSettings.configs,
      serviceProviderConfig: resultingDevModeSettings.serviceProviderConfig,
    };
  }
}

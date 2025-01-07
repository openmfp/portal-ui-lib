import { LocalDevelopmentSettings } from '../../../models';
import { LocalDevelopmentSettingsLocalStorage } from '../../storage-service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevModeSettingsService {
  getDevModeSettings(): LocalDevelopmentSettings {
    const localStorageSetting = LocalDevelopmentSettingsLocalStorage.read();

    if (localStorageSetting?.isActive) {
      return localStorageSetting;
    } else {
      return {
        isActive: false,
        configs: [],
        serviceProviderConfig: {},
      };
    }
  }
}

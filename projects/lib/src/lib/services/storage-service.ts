import { LocalDevelopmentSettings, UserData, UserTokenData } from '../models';
import { UserSettingsValues } from './luigi-config/user-settings-config.service';

export enum LocalStorageKeys {
  LAST_NAVIGATION_URL = 'openmfp.navigation.lastUrl',
  USER_SETTINGS = 'openmfp.settings.userSettings',
  LOCAL_DEVELOPMENT_SETTINGS = 'openmfp.settings.localDevelopmentSettings',
  // deprecated to be removed
  DEVELOPMENT_MODE_CONFIG = 'dev-mode-settings',
}

export const localDevelopmentSettingsLocalStorage = {
  read: (localStorageKey?: string): LocalDevelopmentSettings => {
    let localDevelopmentSettingsFromLocalStore: string;
    try {
      localDevelopmentSettingsFromLocalStore = localStorage.getItem(
        localStorageKey || LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
      );
      localStorageKey && localStorage.removeItem(localStorageKey);
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return null;
    }

    try {
      return JSON.parse(localDevelopmentSettingsFromLocalStore);
    } catch (e) {
      console.error(
        'Failed to parse the local development settings in your localstorage.',
        e,
      );
    }
    return null;
  },

  store: (localDevelopmentSetting: LocalDevelopmentSettings) => {
    try {
      localStorage.setItem(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
        JSON.stringify(localDevelopmentSetting),
      );
    } catch (e) {
      console.error(
        'Failed to stringify the local development settings setting into your localstorage.',
        e,
      );
    }
  },
};

export const userSettingsLocalStorage = {
  read: async (userInfo: UserData): Promise<UserSettingsValues> => {
    const transientSettings = {
      frame_userAccount: {
        name: userInfo.name || '',
        email: userInfo.email || '',
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const storedSettings = localStorage.getItem(
          LocalStorageKeys.USER_SETTINGS,
        );
        const settings = storedSettings ? JSON.parse(storedSettings) : {};

        const resultingSettings = { ...settings, ...transientSettings };
        if (settings.frame_userAccount && transientSettings.frame_userAccount) {
          resultingSettings.frame_userAccount = {
            ...settings.frame_userAccount,
            ...transientSettings.frame_userAccount,
          };
        }
        if (resultingSettings.frame_userAccount?.language === undefined) {
          resultingSettings.frame_userAccount.language = 'en';
        }

        resolve(resultingSettings);
      } catch (e) {
        console.error('Error reading user settings', e);
        reject({
          closeDialog: true,
          message: 'Could not read userSettings from storage...',
        });
      }
    });
  },

  store: async (settings: UserSettingsValues): Promise<UserSettingsValues> => {
    if (settings.frame_userAccount && settings.frame_userAccount.language) {
      delete settings.frame_userAccount.name;
      delete settings.frame_userAccount.email;
    } else {
      delete settings.frame_userAccount;
    }

    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(
          LocalStorageKeys.USER_SETTINGS,
          JSON.stringify(settings),
        );
        resolve(settings);
      } catch (e) {
        console.error('Error storing user settings', e);
        reject({
          closeDialog: true,
          message: 'Could not write userSettings to storage...',
        });
      }
    });
  },
};

import { UserTokenData } from '../models';

export const LocalStorageKeys = {
  lastNavigationUrlKey: 'openmfp.navigation.lastUrl',
  userSettingsStorageKey: 'openmfp.settings.userSettings',
  developmentModeConfigKey: 'dev-mode-settings',
};

export const UserSettingsLocalStorage = {
  async read(userInfo: UserTokenData) {
    const transientSettings = {
      frame_userAccount: {
        name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`,
        mail: userInfo.email || '',
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const storedSettings = localStorage.getItem(
          LocalStorageKeys.userSettingsStorageKey
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

  async store(settings: any) {
    if (settings.frame_userAccount && settings.frame_userAccount.language) {
      delete settings.frame_userAccount.name;
      delete settings.frame_userAccount.mail;
    } else {
      delete settings.frame_userAccount;
    }

    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(
          LocalStorageKeys.userSettingsStorageKey,
          JSON.stringify(settings)
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

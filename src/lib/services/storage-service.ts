import { UserTokenData } from '../models';

export const lastNavigationUrlKey = 'openmfp.navigation.lastUrl';
export const userSettingsStorageKey = 'openmfp.settings.userSettings';

export async function readUserSettingsFromLocalStorage(
  userInfo: UserTokenData
) {
  const transientSettings = {
    frame_userAccount: {
      name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`,
      mail: userInfo.email || '',
    },
  };

  return new Promise((resolve, reject) => {
    try {
      const storedSettings = localStorage.getItem(userSettingsStorageKey);
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
}

import { APP_INITIALIZER } from '@angular/core';
import {
  AuthService,
  I18nService,
  UserSettingsLocalStorage,
} from '../services';

export function initLanguage(
  i18nService: I18nService,
  authService: AuthService
) {
  return async () => {
    const userSettings = (await UserSettingsLocalStorage.read(
      authService.getUser()
    )) as any;
    const storedLanguage = userSettings?.frame_userAccount?.language;

    const validLanguages = (await i18nService.getValidLanguages()).map(
      (l) => l.value
    );

    let language = i18nService.fallbackLanguage;
    if (storedLanguage && validLanguages.includes(storedLanguage)) {
      language = storedLanguage;
    }

    globalThis.Luigi.i18n().setCurrentLocale(language);
    await i18nService.fetchTranslationFile(language);
  };
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: initLanguage,
  multi: true,
  deps: [I18nService, AuthService],
};

export const provideLanguageServices = () => provider;

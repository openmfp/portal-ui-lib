import {
  AuthService,
  I18nService,
  LuigiCoreService,
  userSettingsLocalStorage,
} from '../services';
import { inject, provideAppInitializer } from '@angular/core';

export async function initLanguage(
  i18nService: I18nService,
  authService: AuthService,
  luigiCoreService: LuigiCoreService,
) {
  const userSettings = await userSettingsLocalStorage.read(
    authService.getUserInfo(),
  );
  const storedLanguage = userSettings?.frame_userAccount?.language;

  const validLanguages = (await i18nService.getValidLanguages()).map(
    (l) => l.value,
  );

  let language = i18nService.fallbackLanguage;
  if (storedLanguage && validLanguages.includes(storedLanguage)) {
    language = storedLanguage;
  }

  luigiCoreService.setCurrentLocale(language);
  await i18nService.fetchTranslationFile(language);
}

export const provideLanguageServices = () =>
  provideAppInitializer(() => {
    initLanguage(
      inject(I18nService),
      inject(AuthService),
      inject(LuigiCoreService),
    );
  });

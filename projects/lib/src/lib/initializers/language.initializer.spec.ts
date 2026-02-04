import {
  AuthService,
  I18nService,
  LuigiCoreService,
  userSettingsLocalStorage,
} from '../services';
import { initLanguage, provideLanguageServices } from './language.initializer';
import { MockedFunction, MockedObject } from 'vitest';

describe('initLanguage', () => {
  let i18nService: MockedObject<I18nService>;
  let authService: MockedObject<AuthService>;
  let luigiCoreService: MockedObject<LuigiCoreService>;

  beforeEach(() => {
    vi.spyOn(userSettingsLocalStorage, 'read');
    i18nService = {
      getValidLanguages: vi.fn(),
      fetchTranslationFile: vi.fn(),
      fallbackLanguage: 'en',
    } as any;

    authService = {
      getUserInfo: vi.fn(),
    } as any;

    luigiCoreService = {
      setCurrentLocale: vi.fn(),
    } as any;
  });

  it('uses stored language if valid', async () => {
    (
      userSettingsLocalStorage.read as MockedFunction<
        typeof userSettingsLocalStorage.read
      >
    ).mockResolvedValue({
      frame_userAccount: { language: 'de' },
    });
    i18nService.getValidLanguages.mockResolvedValue([
      { value: 'de', label: 'Deutsch' },
      { value: 'en', label: 'English' },
    ]);

    await initLanguage(i18nService, authService, luigiCoreService);

    expect(luigiCoreService.setCurrentLocale).toHaveBeenCalledWith('de');
    expect(i18nService.fetchTranslationFile).toHaveBeenCalledWith('de');
  });

  it('falls back to default if no valid stored language', async () => {
    (
      userSettingsLocalStorage.read as MockedFunction<
        typeof userSettingsLocalStorage.read
      >
    ).mockResolvedValue({});
    i18nService.getValidLanguages.mockResolvedValue([
      { value: 'fr', label: 'French' },
    ]);

    await initLanguage(i18nService, authService, luigiCoreService);

    expect(luigiCoreService.setCurrentLocale).toHaveBeenCalledWith('en');
    expect(i18nService.fetchTranslationFile).toHaveBeenCalledWith('en');
  });
});

describe('provideLanguageServices', () => {
  it('returns environment providers', () => {
    const providers = provideLanguageServices();
    expect(providers).toBeDefined();
  });
});

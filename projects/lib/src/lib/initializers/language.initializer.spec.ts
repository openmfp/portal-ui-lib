import {
  AuthService,
  I18nService,
  LuigiCoreService,
  userSettingsLocalStorage,
} from '../services';
import { initLanguage, provideLanguageServices } from './language.initializer';

jest.mock('../services', () => ({
  userSettingsLocalStorage: { read: jest.fn() },
}));

describe('initLanguage', () => {
  let i18nService: jest.Mocked<I18nService>;
  let authService: jest.Mocked<AuthService>;
  let luigiCoreService: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    i18nService = {
      getValidLanguages: jest.fn(),
      fetchTranslationFile: jest.fn(),
      fallbackLanguage: 'en',
    } as any;

    authService = {
      getUserInfo: jest.fn(),
    } as any;

    luigiCoreService = {
      setCurrentLocale: jest.fn(),
    } as any;
  });

  it('uses stored language if valid', async () => {
    (userSettingsLocalStorage.read as jest.Mock).mockResolvedValue({
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
    (userSettingsLocalStorage.read as jest.Mock).mockResolvedValue({});
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

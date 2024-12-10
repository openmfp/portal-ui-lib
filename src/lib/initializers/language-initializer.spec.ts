import { APP_INITIALIZER } from '@angular/core';
import { provideLanguageServices } from './language-initializer';
import { AuthService, I18nService } from '../services';
import { readUserSettingsFromLocalStorage } from '../services';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  readUserSettingsFromLocalStorage: jest.fn(),
}));

describe('provideLanguageServices', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let initFn: Function;
  const mockLuigi = {
    i18n: jest.fn().mockReturnValue({
      setCurrentLocale: jest.fn(),
    }),
  };

  beforeAll(() => {
    // Mock globalThis.Luigi
    globalThis.Luigi = mockLuigi as any;
  });

  beforeEach(() => {
    authServiceMock = {
      getUser: jest.fn().mockReturnValue({ id: 'user1' }),
    } as unknown as jest.Mocked<AuthService>;

    i18nServiceMock = {
      getValidLanguages: jest
        .fn()
        .mockResolvedValue([{ value: 'en' }, { value: 'de' }]),
      fallbackLanguage: 'en',
      fetchTranslationFile: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    (readUserSettingsFromLocalStorage as jest.Mock).mockResolvedValue({
      frame_userAccount: {
        language: 'de',
      },
    });

    const provider = provideLanguageServices();
    initFn = provider.useFactory(i18nServiceMock, authServiceMock) as Function;
  });

  it('should correctly initialize the language from user settings if valid', async () => {
    await initFn();

    expect(readUserSettingsFromLocalStorage).toHaveBeenCalledWith({
      id: 'user1',
    });
    expect(i18nServiceMock.getValidLanguages).toHaveBeenCalled();
    expect(mockLuigi.i18n().setCurrentLocale).toHaveBeenCalledWith('de');
    expect(i18nServiceMock.fetchTranslationFile).toHaveBeenCalledWith('de');
  });

  it('should fallback to the default language if user language is invalid', async () => {
    (readUserSettingsFromLocalStorage as jest.Mock).mockResolvedValue({
      frame_userAccount: {
        language: 'fr', // Invalid language
      },
    });

    await initFn();

    expect(mockLuigi.i18n().setCurrentLocale).toHaveBeenCalledWith('en'); // Fallback language
    expect(i18nServiceMock.fetchTranslationFile).toHaveBeenCalledWith('en');
  });

  it('should fallback to the default language if no user language is set', async () => {
    (readUserSettingsFromLocalStorage as jest.Mock).mockResolvedValue(null);

    await initFn();

    expect(mockLuigi.i18n().setCurrentLocale).toHaveBeenCalledWith('en'); // Fallback language
    expect(i18nServiceMock.fetchTranslationFile).toHaveBeenCalledWith('en');
  });

  it('should throw an error if i18nService fails', async () => {
    i18nServiceMock.getValidLanguages.mockRejectedValue(
      new Error('Failed to fetch languages')
    );

    await expect(initFn()).rejects.toThrow('Failed to fetch languages');
  });

  it('should provide the correct APP_INITIALIZER configuration', () => {
    const provider = provideLanguageServices();
    expect(provider).toEqual({
      provide: APP_INITIALIZER,
      useFactory: expect.any(Function),
      multi: true,
      deps: [I18nService, AuthService],
    });
  });
});

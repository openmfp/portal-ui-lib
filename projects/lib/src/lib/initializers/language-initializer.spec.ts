import { APP_INITIALIZER } from '@angular/core';
import { mock } from 'jest-mock-extended';
import { provideLanguageServices } from './language-initializer';
import {
  AuthService,
  I18nService,
  LuigiCoreService,
  userSettingsLocalStorage,
} from '../services';

describe('provideLanguageServices', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let initFn: Function;

  beforeEach(() => {
    luigiCoreServiceMock = mock();
    authServiceMock = {
      getUserInfo: jest.fn().mockReturnValue({ userId: 'user1' }),
    } as unknown as jest.Mocked<AuthService>;

    i18nServiceMock = {
      getValidLanguages: jest
        .fn()
        .mockResolvedValue([{ value: 'en' }, { value: 'de' }]),
      fallbackLanguage: 'en',
      fetchTranslationFile: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    userSettingsLocalStorage.read = jest.fn().mockResolvedValue({
      frame_userAccount: {
        language: 'de',
      },
    });

    const provider = provideLanguageServices();
    initFn = provider.useFactory(
      i18nServiceMock,
      authServiceMock,
      luigiCoreServiceMock
    ) as Function;
  });

  it('should correctly initialize the language from user settings if valid', async () => {
    await initFn();

    expect(userSettingsLocalStorage.read).toHaveBeenCalledWith({
      userId: 'user1',
    });
    expect(i18nServiceMock.getValidLanguages).toHaveBeenCalled();
    expect(luigiCoreServiceMock.setCurrentLocale).toHaveBeenCalledWith('de');
    expect(i18nServiceMock.fetchTranslationFile).toHaveBeenCalledWith('de');
  });

  it('should fallback to the default language if user language is invalid', async () => {
    userSettingsLocalStorage.read = jest.fn().mockResolvedValue({
      frame_userAccount: {
        language: 'fr',
      },
    });

    await initFn();

    expect(luigiCoreServiceMock.setCurrentLocale).toHaveBeenCalledWith('en'); // Fallback language
    expect(i18nServiceMock.fetchTranslationFile).toHaveBeenCalledWith('en');
  });

  it('should fallback to the default language if no user language is set', async () => {
    userSettingsLocalStorage.read = jest.fn().mockResolvedValue(null);

    await initFn();

    expect(luigiCoreServiceMock.setCurrentLocale).toHaveBeenCalledWith('en'); // Fallback language
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
      deps: [I18nService, AuthService, LuigiCoreService],
    });
  });
});

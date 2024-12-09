import { TestBed } from '@angular/core/testing';
import { AuthService, I18nService } from '../services';
import { readUserSettingsFromLocalStorage } from '../services';

// Mock the imported function
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  readUserSettingsFromLocalStorage: jest.fn(),
}));

describe('Language Initialization', () => {
  let mockI18nService: jest.Mocked<I18nService>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockI18nService = {
      getValidLanguages: jest.fn().mockResolvedValue([
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
      ]),
      fetchTranslationFile: jest.fn(),
      fallbackLanguage: 'en',
    } as any;

    mockAuthService = {
      getUser: jest.fn().mockReturnValue({}),
    } as any;

    // Mock global Luigi object
    (global as any).Luigi = {
      i18n: jest.fn().mockReturnValue({
        setCurrentLocale: jest.fn(),
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
  });

  const initLanguage = async () => {
    const userSettings = (await readUserSettingsFromLocalStorage(
      mockAuthService.getUser()
    )) as any;
    const storedLanguage = userSettings?.frame_userAccount?.language;

    const validLanguages = (await mockI18nService.getValidLanguages()).map(
      (l) => l.value
    );

    let language = mockI18nService.fallbackLanguage;
    if (storedLanguage && validLanguages.includes(storedLanguage)) {
      language = storedLanguage;
    }

    globalThis.Luigi.i18n().setCurrentLocale(language);
    await mockI18nService.fetchTranslationFile(language);
  };

  it('should set fallback language when no stored language is valid', async () => {
    // Arrange
    (readUserSettingsFromLocalStorage as jest.Mock).mockResolvedValue({
      frame_userAccount: { language: 'invalid' },
    });

    // Act
    await initLanguage();

    // Assert
    expect(mockI18nService.getValidLanguages).toHaveBeenCalled();
    expect(global.Luigi.i18n().setCurrentLocale).toHaveBeenCalledWith('en');
    expect(mockI18nService.fetchTranslationFile).toHaveBeenCalledWith('en');
  });

  it('should set stored language when it is valid', async () => {
    // Arrange
    (readUserSettingsFromLocalStorage as jest.Mock).mockResolvedValue({
      frame_userAccount: { language: 'fr' },
    });

    // Act
    await initLanguage();

    // Assert
    expect(mockI18nService.getValidLanguages).toHaveBeenCalled();
    expect(global.Luigi.i18n().setCurrentLocale).toHaveBeenCalledWith('fr');
    expect(mockI18nService.fetchTranslationFile).toHaveBeenCalledWith('fr');
  });

  it('should handle case with no user settings', async () => {
    // Arrange
    (readUserSettingsFromLocalStorage as jest.Mock).mockResolvedValue(null);

    // Act
    await initLanguage();

    // Assert
    expect(mockI18nService.getValidLanguages).toHaveBeenCalled();
    expect(global.Luigi.i18n().setCurrentLocale).toHaveBeenCalledWith('en');
    expect(mockI18nService.fetchTranslationFile).toHaveBeenCalledWith('en');
  });
});

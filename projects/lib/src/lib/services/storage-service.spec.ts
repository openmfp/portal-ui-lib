import { UserTokenData, LocalDevelopmentSettings } from '../models';
import {
  LocalStorageKeys,
  UserSettingsLocalStorage,
  LocalDevelopmentSettingsLocalStorage,
} from './storage-service';

describe('LocalDevelopmentSettingsLocalStorage', () => {
  let localStorageMock: jest.Mocked<Storage>;

  beforeEach(() => {
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });
  });

  describe('read', () => {
    it('should return parsed settings when valid JSON exists in localStorage', () => {
      const mockSettings: LocalDevelopmentSettings = {
        isActive: true,
        configs: [
          { url: 'http://localhost:3000', data: { id: 'config1' } as any },
          { url: 'http://localhost:3001', data: { id: 'config2' } as any },
        ],
        serviceProviderConfig: {
          endpoint: 'http://localhost',
          apiKey: 'test-key',
        },
      };
      localStorageMock.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify(mockSettings));

      const result = LocalDevelopmentSettingsLocalStorage.read();

      expect(result).toEqual(mockSettings);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS
      );
    });

    it('should return null when localStorage is not available', () => {
      localStorageMock.getItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = LocalDevelopmentSettingsLocalStorage.read();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return null when stored JSON is invalid', () => {
      localStorageMock.getItem = jest.fn().mockReturnValue('invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = LocalDevelopmentSettingsLocalStorage.read();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return null when no settings exist in localStorage', () => {
      localStorageMock.getItem = jest.fn().mockReturnValue(null);

      const result = LocalDevelopmentSettingsLocalStorage.read();

      expect(result).toBeNull();
    });
  });

  describe('store', () => {
    it('should successfully store valid LocalDevelopmentSettings in localStorage', () => {
      const testSettings: LocalDevelopmentSettings = {
        isActive: true,
        configs: [{ url: 'http://test.com' }],
        serviceProviderConfig: {
          key1: 'value1',
        },
      };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      LocalDevelopmentSettingsLocalStorage.store(testSettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
        JSON.stringify(testSettings)
      );
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should store empty LocalDevelopmentSettings object', () => {
      const emptySettings: LocalDevelopmentSettings = {
        isActive: false,
        configs: [],
        serviceProviderConfig: {},
      };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      LocalDevelopmentSettingsLocalStorage.store(emptySettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
        JSON.stringify(emptySettings)
      );
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle localStorage error and log to console', () => {
      // Simulate localStorage error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      const testSettings: LocalDevelopmentSettings = {
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      LocalDevelopmentSettingsLocalStorage.store(testSettings);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to stringify the local development settings setting into your localstorage.',
        expect.any(Error)
      );
    });

    it('should handle circular reference in settings object', () => {
      const circularSettings: any = {
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      };
      circularSettings.circular = circularSettings;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      LocalDevelopmentSettingsLocalStorage.store(circularSettings);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to stringify the local development settings setting into your localstorage.',
        expect.any(Error)
      );
    });
  });
});

describe('UserSettingsLocalStorage', () => {
  describe('readUserSettingsFromLocalStorage', () => {
    let localStorageMock: Storage;

    beforeEach(() => {
      localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        configurable: true,
      });
    });

    const mockUserInfo: UserTokenData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    } as any;

    it('should return default settings when no stored settings exist', async () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);

      const result = await UserSettingsLocalStorage.read(mockUserInfo);

      expect(result).toEqual({
        frame_userAccount: {
          name: 'John Doe',
          mail: 'john.doe@example.com',
          language: 'en',
        },
      });
    });

    it('should merge existing stored settings with transient settings', async () => {
      const existingSettings = {
        frame_userAccount: {
          role: 'admin',
        },
      };
      (localStorageMock.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(existingSettings)
      );

      const result = await UserSettingsLocalStorage.read(mockUserInfo);

      expect(result).toEqual({
        frame_userAccount: {
          name: 'John Doe',
          mail: 'john.doe@example.com',
          role: 'admin',
          language: 'en',
        },
      });
    });

    it('should handle error when localStorage parsing fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (localStorageMock.getItem as jest.Mock).mockReturnValue('invalid-json');

      await expect(UserSettingsLocalStorage.read(mockUserInfo)).rejects.toEqual(
        {
          closeDialog: true,
          message: 'Could not read userSettings from storage...',
        }
      );
    });

    it('should handle empty user info gracefully', async () => {
      const emptyUserInfo: UserTokenData = {
        first_name: '',
        last_name: '',
        email: '',
      } as any;

      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);

      const result = await UserSettingsLocalStorage.read(emptyUserInfo);

      expect(result).toEqual({
        frame_userAccount: {
          name: ' ',
          mail: '',
          language: 'en',
        },
      });
    });
  });

  describe('storeUserSettingsIntoLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
      jest.spyOn(localStorage, 'setItem');
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should store settings with language, removing name and mail', async () => {
      const settings = {
        frame_userAccount: {
          language: 'en',
          name: 'John Doe',
          mail: 'john@example.com',
        },
      };

      const result = await UserSettingsLocalStorage.store(settings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
        JSON.stringify({
          frame_userAccount: {
            language: 'en',
          },
        })
      );
      expect(result).toEqual({
        frame_userAccount: {
          language: 'en',
        },
      });
    });

    it('should remove frame_userAccount if language is missing', async () => {
      const settings = {
        frame_userAccount: {
          name: 'John Doe',
          mail: 'john@example.com',
        },
      };

      const result = await UserSettingsLocalStorage.store(settings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
        JSON.stringify({})
      );
      expect(result).toEqual({});
    });

    it('should preserve other settings when language exists', async () => {
      const settings = {
        otherSetting: 'value',
        frame_userAccount: {
          language: 'en',
          name: 'John Doe',
          mail: 'john@example.com',
        },
      };

      const result = await UserSettingsLocalStorage.store(settings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
        JSON.stringify({
          otherSetting: 'value',
          frame_userAccount: {
            language: 'en',
          },
        })
      );
      expect(result).toEqual({
        otherSetting: 'value',
        frame_userAccount: {
          language: 'en',
        },
      });
    });

    it('should handle localStorage setItem error', async () => {
      const settings = {
        frame_userAccount: {
          language: 'en',
        },
      };

      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(UserSettingsLocalStorage.store(settings)).rejects.toEqual({
        closeDialog: true,
        message: 'Could not write userSettings to storage...',
      });
    });
  });
});

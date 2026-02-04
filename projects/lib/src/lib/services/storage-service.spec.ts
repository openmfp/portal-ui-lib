import { LocalDevelopmentSettings, UserData } from '../models';
import { UserSettingsValues } from './luigi-config/user-settings-config.service';
import { MockedFunction } from 'vitest';

type LocalStorageMock = {
  getItem: MockedFunction<(key: string) => string | null>;
  setItem: MockedFunction<(key: string, value: string) => void>;
  removeItem: MockedFunction<(key: string) => void>;
  clear: MockedFunction<() => void>;
  key: MockedFunction<(index: number) => string | null>;
  length: number;
};

const createLocalStorageMock = (): LocalStorageMock => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
});

describe('LocalDevelopmentSettingsLocalStorage', () => {
  let localStorageMock: LocalStorageMock;

  let LocalStorageKeys: any;
  let localDevelopmentSettingsLocalStorage: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllGlobals();

    localStorageMock = createLocalStorageMock();

    vi.stubGlobal('localStorage', localStorageMock as any);

    const mod = await import('./storage-service');
    LocalStorageKeys = mod.LocalStorageKeys;
    localDevelopmentSettingsLocalStorage =
      mod.localDevelopmentSettingsLocalStorage;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));

      const result = localDevelopmentSettingsLocalStorage.read();

      expect(result).toEqual(mockSettings);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
      );
    });

    it('should return null when localStorage is not available', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = localDevelopmentSettingsLocalStorage.read();

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
      );
    });

    it('should return null when stored JSON is invalid', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = localDevelopmentSettingsLocalStorage.read();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should return null when no settings exist in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = localDevelopmentSettingsLocalStorage.read();

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
      );
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

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      localDevelopmentSettingsLocalStorage.store(testSettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
        JSON.stringify(testSettings),
      );
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should store empty LocalDevelopmentSettings object', () => {
      const emptySettings: LocalDevelopmentSettings = {
        isActive: false,
        configs: [],
        serviceProviderConfig: {},
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      localDevelopmentSettingsLocalStorage.store(emptySettings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.LOCAL_DEVELOPMENT_SETTINGS,
        JSON.stringify(emptySettings),
      );
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle localStorage error and log to console', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const testSettings: LocalDevelopmentSettings = {
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      localDevelopmentSettingsLocalStorage.store(testSettings);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to stringify the local development settings setting into your localstorage.',
        expect.any(Error),
      );
    });

    it('should handle circular reference in settings object', () => {
      const circularSettings: any = {
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      };
      circularSettings.circular = circularSettings;

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      localDevelopmentSettingsLocalStorage.store(circularSettings);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to stringify the local development settings setting into your localstorage.',
        expect.any(Error),
      );
    });
  });
});

describe('UserSettingsLocalStorage', () => {
  let originalLocalStorage: Storage;
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    localStorageMock = createLocalStorageMock();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });

    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });

    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('readUserSettingsFromLocalStorage', () => {
    let userSettingsLocalStorage: any;
    let LocalStorageKeys: any;

    beforeEach(async () => {
      vi.resetModules();
      vi.unstubAllGlobals();

      localStorageMock = createLocalStorageMock();
      vi.stubGlobal('localStorage', localStorageMock as any);

      const mod = await import('./storage-service');
      userSettingsLocalStorage = mod.userSettingsLocalStorage;
      LocalStorageKeys = mod.LocalStorageKeys;
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.clearAllMocks();
      vi.unstubAllGlobals();
    });

    const mockUserInfo: UserData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    } as any;

    it('should return default settings when no stored settings exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await userSettingsLocalStorage.read(mockUserInfo);

      expect(result).toEqual({
        frame_userAccount: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          language: 'en',
        },
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
      );
    });

    it('should merge existing stored settings with transient settings', async () => {
      const existingSettings = {
        frame_userAccount: {
          role: 'admin',
        },
      };
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(existingSettings),
      );

      const result = await userSettingsLocalStorage.read(mockUserInfo);

      expect(result).toEqual({
        frame_userAccount: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'admin',
          language: 'en',
        },
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
      );
    });

    it('should handle error when localStorage parsing fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid-json');

      await expect(userSettingsLocalStorage.read(mockUserInfo)).rejects.toEqual(
        {
          closeDialog: true,
          message: 'Could not read userSettings from storage...',
        },
      );
    });

    it('should handle empty user info gracefully', async () => {
      const emptyUserInfo: UserData = {
        name: '',
        email: '',
      } as any;

      localStorageMock.getItem.mockReturnValue(null);

      const result = await userSettingsLocalStorage.read(emptyUserInfo);

      expect(result).toEqual({
        frame_userAccount: {
          name: '',
          email: '',
          language: 'en',
        },
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
      );
    });
  });

  describe('storeUserSettingsIntoLocalStorage', () => {
    let userSettingsLocalStorage: any;
    let LocalStorageKeys: any;

    beforeEach(async () => {
      vi.resetModules();
      vi.unstubAllGlobals();

      localStorageMock = createLocalStorageMock();
      vi.stubGlobal('localStorage', localStorageMock as any);

      const mod = await import('./storage-service');
      userSettingsLocalStorage = mod.userSettingsLocalStorage;
      LocalStorageKeys = mod.LocalStorageKeys;
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.clearAllMocks();
      vi.unstubAllGlobals();
    });

    it('should store settings with language, removing name and mail', async () => {
      const settings = {
        frame_userAccount: {
          language: 'en',
          name: 'John Doe',
          email: 'john@example.com',
        },
      } as UserSettingsValues;

      const result = await userSettingsLocalStorage.store(settings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
        JSON.stringify({
          frame_userAccount: {
            language: 'en',
          },
        }),
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
          email: 'john@example.com',
        },
      } as UserSettingsValues;

      const result = await userSettingsLocalStorage.store(settings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
        JSON.stringify({}),
      );
      expect(result).toEqual({});
    });

    it('should preserve other settings when language exists', async () => {
      const settings = {
        otherSetting: 'value',
        frame_userAccount: {
          language: 'en',
          name: 'John Doe',
          email: 'john@example.com',
        },
      } as UserSettingsValues;

      const result = await userSettingsLocalStorage.store(settings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        LocalStorageKeys.USER_SETTINGS,
        JSON.stringify({
          otherSetting: 'value',
          frame_userAccount: {
            language: 'en',
          },
        }),
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
      } as UserSettingsValues;

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(userSettingsLocalStorage.store(settings)).rejects.toEqual({
        closeDialog: true,
        message: 'Could not write userSettings to storage...',
      });
    });
  });
});

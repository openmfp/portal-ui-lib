import { UserTokenData } from '../models';
import { LocalStorageKeys, UserSettingsLocalStorage } from './storage-service';

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

    await expect(UserSettingsLocalStorage.read(mockUserInfo)).rejects.toEqual({
      closeDialog: true,
      message: 'Could not read userSettings from storage...',
    });
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
      LocalStorageKeys.userSettingsStorageKey,
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
      LocalStorageKeys.userSettingsStorageKey,
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
      LocalStorageKeys.userSettingsStorageKey,
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

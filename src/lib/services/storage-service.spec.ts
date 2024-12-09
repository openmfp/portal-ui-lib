import { UserTokenData } from '../models';
import { readUserSettingsFromLocalStorage } from './storage-service';

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

    const result = await readUserSettingsFromLocalStorage(mockUserInfo);

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

    const result = await readUserSettingsFromLocalStorage(mockUserInfo);

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

    await expect(
      readUserSettingsFromLocalStorage(mockUserInfo)
    ).rejects.toEqual({
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

    const result = await readUserSettingsFromLocalStorage(emptyUserInfo);

    expect(result).toEqual({
      frame_userAccount: {
        name: ' ',
        mail: '',
        language: 'en',
      },
    });
  });
});

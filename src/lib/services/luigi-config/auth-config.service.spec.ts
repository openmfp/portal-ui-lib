import { AuthConfigService } from './auth-config.service';
import { AuthService } from '../portal/auth.service';
import { LocalStorageService } from '../storage.service';
import { LuigiCoreService } from '../luigi-core.service';
import oAuth2 from '@luigi-project/plugin-auth-oauth2';

jest.mock('@luigi-project/plugin-auth-oauth2');

describe('AuthConfigService', () => {
  let service: AuthConfigService;
  let authServiceMock: jest.Mocked<AuthService>;
  let storageServiceMock: jest.Mocked<LocalStorageService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    authServiceMock = {
      getUserInfo: jest.fn(),
    } as any;

    storageServiceMock = {
      clearLocalStorage: jest.fn(),
    } as any;

    luigiCoreServiceMock = {
      showAlert: jest.fn(),
    } as any;

    service = new AuthConfigService(
      authServiceMock,
      storageServiceMock,
      luigiCoreServiceMock
    );

    // Create a new object with configurable properties
    (window as any).location = {
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      hash: '',
      host: 'localhost',
      hostname: 'localhost',
      href: 'http://localhost',
      origin: 'http://localhost',
      pathname: '/',
      port: '',
      protocol: 'http:',
      search: '',
    };

    // Mock global fetch
    window.fetch = jest.fn(() =>
      Promise.resolve({ ok: true } as Response)
    ) as jest.Mock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAuthConfig', () => {
    const oauthServerUrl = 'https://example.com/oauth';
    const clientId = 'test-client-id';

    it('should return correct auth config', () => {
      const config = service.getAuthConfig(oauthServerUrl, clientId);

      expect(config.use).toBe('oAuth2AuthCode');
      expect(config.storage).toBe('none');
      expect(config.oAuth2AuthCode.idpProvider).toBe(oAuth2);
      expect(config.oAuth2AuthCode.authorizeUrl).toBe(oauthServerUrl);
      expect(config.oAuth2AuthCode.oAuthData.client_id).toBe(clientId);
    });

    it('should handle userInfoFn correctly', async () => {
      const mockUserInfo = {
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      } as any;
      authServiceMock.getUserInfo.mockReturnValue(mockUserInfo);

      const config = service.getAuthConfig(oauthServerUrl, clientId);
      const userInfo = await config.oAuth2AuthCode.userInfoFn();

      expect(authServiceMock.getUserInfo).toHaveBeenCalled();
      expect(userInfo).toEqual(mockUserInfo);
      expect(window.fetch).toHaveBeenCalledWith(
        mockUserInfo.picture,
        expect.any(Object)
      );
    });

    it('should handle userInfoFn when fetch fails', async () => {
      const mockUserInfo = {
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      } as any;
      authServiceMock.getUserInfo.mockReturnValue(mockUserInfo);
      (window.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Fetch failed')
      );

      const config = service.getAuthConfig(oauthServerUrl, clientId);
      const userInfo = await config.oAuth2AuthCode.userInfoFn();

      expect(authServiceMock.getUserInfo).toHaveBeenCalled();
      expect(userInfo).toEqual({ ...mockUserInfo, picture: '' });
    });

    it('should handle onAuthExpired event', () => {
      const config = service.getAuthConfig(oauthServerUrl, clientId);

      config.events.onAuthExpired();

      expect(storageServiceMock.clearLocalStorage).toHaveBeenCalled();
      expect(sessionStorage.getItem('portal.relogin.url')).toEqual(
        expect.any(String)
      );
    });

    it('should handle onAuthExpireSoon event', () => {
      const config = service.getAuthConfig(oauthServerUrl, clientId);
      config.events.onAuthExpireSoon();

      expect(luigiCoreServiceMock.showAlert).toHaveBeenCalledWith({
        text: 'Login session expires soon',
        type: 'warning',
      });
    });

    it('should handle onLogout event', () => {
      const config = service.getAuthConfig(oauthServerUrl, clientId);
      const result = config.events.onLogout();

      expect(storageServiceMock.clearLocalStorage).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});

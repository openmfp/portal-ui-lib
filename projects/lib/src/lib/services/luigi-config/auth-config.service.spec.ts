import { LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { AuthEvent, UserData } from '../../models';
import { AuthService } from '../portal';
import { AuthConfigService } from './auth-config.service';
import { LuigiAuthEventsCallbacksService } from './luigi-auth-events-callbacks.service';
import { TestBed } from '@angular/core/testing';

describe('AuthConfigService', () => {
  let service: AuthConfigService;
  let authServiceMock: jest.Mocked<AuthService>;
  let luigiAuthEventsCallbacksServiceMock: jest.Mocked<LuigiAuthEventsCallbacksService>;

  beforeEach(() => {
    authServiceMock = {
      getUserInfo: jest.fn(),
      authEvent: jest.fn(),
    } as any;

    luigiAuthEventsCallbacksServiceMock = {
      onAuthSuccessful: jest.fn(),
      onAuthError: jest.fn(),
      onAuthExpired: jest.fn(),
      onLogout: jest.fn(),
      onAuthExpireSoon: jest.fn(),
      onAuthConfigError: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthConfigService,
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
          useValue: luigiAuthEventsCallbacksServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAuthConfig', () => {
    it('should return the correct auth config', () => {
      const oauthServerUrl = 'https://example.com/oauth';
      const clientId = 'test-client-id';

      const baseDomain = 'https://example.com';
      const config = service.getAuthConfig({
        oauthServerUrl,
        clientId,
        baseDomain,
      });

      expect(config.use).toBe('oAuth2AuthCode');
      expect(config.storage).toBe('none');
      expect(config.disableAutoLogin).toBe(false);
      expect(config.oAuth2AuthCode.authorizeUrl).toBe(oauthServerUrl);
      expect(config.oAuth2AuthCode.oAuthData.client_id).toBe(clientId);
    });

    it('should handle userInfoFn correctly', async () => {
      const userInfo = {
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      } as UserData;
      authServiceMock.getUserInfo.mockReturnValue(userInfo);

      const config = service.getAuthConfig({
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'client-id',
        baseDomain: 'https://example.com',
      });
      const userInfoFn = config.oAuth2AuthCode.userInfoFn;

      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await userInfoFn();

      expect(result).toEqual(userInfo);
      expect(global.fetch).toHaveBeenCalledWith(
        userInfo.picture,
        expect.any(Object),
      );
    });

    it('should handle userInfoFn when fetch fails', async () => {
      const userPicture = 'https://example.com/pic.jpg';
      const userInfo = {
        name: 'Test User',
        picture: userPicture,
      } as UserData;
      authServiceMock.getUserInfo.mockReturnValue(userInfo);

      const config = service.getAuthConfig({
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'client-id',
        baseDomain: 'https://example.com',
      });
      const userInfoFn = config.oAuth2AuthCode.userInfoFn;

      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      const result = await userInfoFn();

      expect(result).toEqual({ ...userInfo, picture: '' });
      expect(global.fetch).toHaveBeenCalledWith(
        userPicture,
        expect.any(Object),
      );
    });
  });

  describe('auth events', () => {
    let config: ReturnType<typeof service.getAuthConfig>;
    const testSettings = {};
    const testAuthData = {};
    const testError = new Error('Test error');

    beforeEach(() => {
      config = service.getAuthConfig({
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'client-id',
        baseDomain: 'https://example.com',
      });
    });

    it('should handle onAuthSuccessful', () => {
      config.events.onAuthSuccessful(testSettings, testAuthData);

      expect(authServiceMock.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_SUCCESSFUL,
      );
      expect(
        luigiAuthEventsCallbacksServiceMock.onAuthSuccessful,
      ).toHaveBeenCalledWith(testSettings, testAuthData);
    });

    it('should handle onAuthError', () => {
      config.events.onAuthError(testSettings, testError);

      expect(authServiceMock.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_ERROR,
      );
      expect(
        luigiAuthEventsCallbacksServiceMock.onAuthError,
      ).toHaveBeenCalledWith(testSettings, testError);
    });

    it('should handle onAuthExpired', () => {
      config.events.onAuthExpired(testSettings);

      expect(authServiceMock.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_EXPIRED,
      );
      expect(
        luigiAuthEventsCallbacksServiceMock.onAuthExpired,
      ).toHaveBeenCalledWith(testSettings);
    });

    it('should handle onLogout', () => {
      config.events.onLogout(testSettings);

      expect(authServiceMock.authEvent).toHaveBeenCalledWith(AuthEvent.LOGOUT);
      expect(luigiAuthEventsCallbacksServiceMock.onLogout).toHaveBeenCalledWith(
        testSettings,
      );
    });

    it('should handle onAuthExpireSoon', () => {
      config.events.onAuthExpireSoon(testSettings);

      expect(authServiceMock.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_EXPIRE_SOON,
      );
      expect(
        luigiAuthEventsCallbacksServiceMock.onAuthExpireSoon,
      ).toHaveBeenCalledWith(testSettings);
    });

    it('should handle onAuthConfigError', () => {
      config.events.onAuthConfigError(testSettings, testError);

      expect(authServiceMock.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_CONFIG_ERROR,
      );
      expect(
        luigiAuthEventsCallbacksServiceMock.onAuthConfigError,
      ).toHaveBeenCalledWith(testSettings, testError);
    });
  });
});

import { LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { AuthEvent, UserData } from '../../models';
import { AuthService, EnvConfigService } from '../portal';
import { AuthConfigService } from './auth-config.service';
import { LuigiAuthEventsCallbacksService } from './luigi-auth-events-callbacks.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';

describe('AuthConfigService', () => {
  let service: AuthConfigService;
  let authServiceMock: jest.Mocked<AuthService>;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let luigiAuthEventsCallbacksServiceMock: jest.Mocked<LuigiAuthEventsCallbacksService>;

  beforeEach(() => {
    envConfigServiceMock = mock();

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
        { provide: EnvConfigService, useValue: envConfigServiceMock },
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
    it('should return the correct auth config', async () => {
      const oauthServerUrl = 'https://example.com/oauth';
      const clientId = 'test-client-id';
      const baseDomain = 'https://example.com';
      envConfigServiceMock.getEnvConfig.mockResolvedValue({
        oauthServerUrl,
        clientId,
        baseDomain,
      } as any);

      const config = await service.getAuthConfig();

      expect(config?.use).toBe('oAuth2AuthCode');
      expect(config?.storage).toBe('none');
      expect(config?.disableAutoLogin).toBe(false);
      expect(config?.oAuth2AuthCode?.authorizeUrl).toBe(oauthServerUrl);
      expect(config?.oAuth2AuthCode?.oAuthData?.client_id).toBe(clientId);
    });

    it('should handle userInfoFn correctly', async () => {
      const userInfo = {
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      } as UserData;
      authServiceMock.getUserInfo.mockReturnValue(userInfo);

      envConfigServiceMock.getEnvConfig.mockResolvedValue({
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'client-id',
        baseDomain: 'https://example.com',
      } as any);

      const config = await service.getAuthConfig();
      const userInfoFn = config?.oAuth2AuthCode?.userInfoFn;

      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await userInfoFn?.();

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

      envConfigServiceMock.getEnvConfig.mockResolvedValue({
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'client-id',
        baseDomain: 'https://example.com',
      } as any);
      const config = await service.getAuthConfig();
      const userInfoFn = config?.oAuth2AuthCode?.userInfoFn;

      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      const result = await userInfoFn?.();

      expect(result).toEqual({ ...userInfo, picture: '' });
      expect(global.fetch).toHaveBeenCalledWith(
        userPicture,
        expect.any(Object),
      );
    });
  });

  describe('auth events', () => {
    let config: any;
    const testSettings = {};
    const testAuthData = {};
    const testError = new Error('Test error');

    beforeEach(async () => {
      envConfigServiceMock.getEnvConfig.mockResolvedValue({
        oauthServerUrl: 'https://example.com/oauth',
        clientId: 'client-id',
        baseDomain: 'https://example.com',
      } as any);
      config = await service.getAuthConfig();
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

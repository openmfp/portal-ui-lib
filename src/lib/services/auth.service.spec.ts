import { UserTokenData } from '../model/user';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthTokenData, AuthData } from '../model/env';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode');

describe('AuthService', () => {
  let service: AuthService;
  let httpClientMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
    } as any;

    service = new AuthService(httpClientMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('auth', () => {
    it('should make a POST request and set auth data', async () => {
      const mockResponse: AuthTokenData = {
        access_token: 'mock_token',
        expires_in: '3600',
      };
      httpClientMock.post.mockReturnValue(of(mockResponse));

      await service.auth('mock_code', 'mock_state');

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/rest/auth?code=mock_code&state=mock_state',
        {}
      );
      expect(service.getAuthData()).toEqual({
        accessTokenExpirationDate: expect.any(Number),
        idToken: 'mock_token',
      });
    });
  });

  describe('setAuthData and getAuthData', () => {
    it('should set and get auth data correctly', () => {
      const mockAuthTokenData: AuthTokenData = {
        access_token: 'mock_token',
        expires_in: '3600',
      };

      service.setAuthData(mockAuthTokenData);
      const authData = service.getAuthData();

      expect(authData).toEqual({
        accessTokenExpirationDate: expect.any(Number),
        idToken: 'mock_token',
      });
    });
  });

  describe('getToken', () => {
    it('should return the id token if auth data exists', () => {
      const mockAuthData: AuthData = {
        accessTokenExpirationDate: 123456789,
        idToken: 'mock_token',
      };
      jest.spyOn(service, 'getAuthData').mockReturnValue(mockAuthData);

      const token = service.getToken();

      expect(token).toBe('mock_token');
    });

    it('should return an empty object if no auth data', () => {
      jest.spyOn(service, 'getAuthData').mockReturnValue(undefined as any);

      const token = service.getToken();

      expect(token).toEqual({});
    });
  });

  describe('getUser', () => {
    it('should return decoded token if auth data exists', () => {
      const mockDecodedToken = { sub: 'user123' };
      (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);

      const mockAuthData: AuthData = {
        accessTokenExpirationDate: 123456789,
        idToken: 'mock_token',
      };
      jest.spyOn(service, 'getAuthData').mockReturnValue(mockAuthData);

      const user = service.getUser();

      expect(user).toEqual(mockDecodedToken);
      expect(jwtDecode).toHaveBeenCalledWith('mock_token');
    });

    it('should return decoded user data', () => {
      (jwtDecode as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      service.setAuthData({ access_token: 'test_token', expires_in: '3600' });

      expect(service.getUser()).toEqual(null);
    });

    it('should return an empty object if no auth data', () => {
      jest.spyOn(service, 'getAuthData').mockReturnValue(undefined as any);

      const user = service.getUser();

      expect(user).toEqual({});
    });
  });

  describe('getUsername', () => {
    it('should return the sub from the decoded token', () => {
      jest
        .spyOn(service, 'getUser')
        .mockReturnValue({ sub: 'user123' } as UserTokenData);

      const username = service.getUsername();

      expect(username).toBe('user123');
    });
  });

  describe('getUserEmail', () => {
    it('should return the mail from the decoded token', () => {
      jest
        .spyOn(service, 'getUser')
        .mockReturnValue({ mail: 'user@example.com' } as UserTokenData);

      const email = service.getUserEmail();

      expect(email).toBe('user@example.com');
    });
  });

  describe('getUserInfo', () => {
    it('should return user info object', () => {
      jest.spyOn(service, 'getUser').mockReturnValue({
        first_name: 'John',
        last_name: 'Doe',
        mail: 'john.doe@example.com',
        sub: 'user123',
      });

      const userInfo = service.getUserInfo();

      expect(userInfo).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        description: 'john.doe@example.com',
        picture: '',
        icon: false,
        initials: 'JD',
      });
    });

    it('should handle undefined first name and last name', () => {
      jest.spyOn(service, 'getUser').mockReturnValue({
        mail: 'john.doe@example.com',
        sub: 'user123',
      } as UserTokenData);

      const userInfo = service.getUserInfo();

      expect(userInfo).toEqual({
        name: ' ',
        email: 'john.doe@example.com',
        description: 'john.doe@example.com',
        picture: '',
        icon: false,
        initials: '',
      });
    });
  });
});

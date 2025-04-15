import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, take, toArray } from 'rxjs';
import {
  AuthTokenData,
  AuthData,
  UserTokenData,
  AuthEvent,
} from '../../models';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode');

describe('AuthService', () => {
  let service: AuthService;
  let httpClientMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    service = new AuthService(httpClientMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('auth', () => {
    it('should make a POST request and set auth data', async () => {
      const mockResponse: AuthTokenData = {
        access_token: 'mock_access_token',
        id_token: 'mock_id_token',
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
        idToken: 'mock_id_token',
      });
    });
  });

  describe('refresh', () => {
    it('should make a GET request and set auth data', async () => {
      const mockResponse: AuthTokenData = {
        access_token: 'mock_access_token',
        id_token: 'mock_id_token',
        expires_in: '3600',
      };
      httpClientMock.get.mockReturnValue(of(mockResponse));

      await service.refresh();

      expect(httpClientMock.get).toHaveBeenCalledWith('/rest/auth/refresh');
      expect(service.getAuthData()).toEqual({
        accessTokenExpirationDate: expect.any(Number),
        idToken: 'mock_id_token',
      });
    });

    it('should make a GET request and not set auth data', async () => {
      const mockResponse: AuthTokenData = undefined;
      httpClientMock.get.mockReturnValue(of(mockResponse));

      await service.refresh();

      expect(httpClientMock.get).toHaveBeenCalledWith('/rest/auth/refresh');
      expect(service.getAuthData()).toBeUndefined();
    });
  });

  describe('setAuthData and getAuthData', () => {
    it('should set and get auth data correctly', () => {
      const mockAuthTokenData: AuthTokenData = {
        access_token: 'mock_token',
        id_token: 'mock_id_token',
        expires_in: '3600',
      };

      service['setAuthData'](mockAuthTokenData);
      const authData = service.getAuthData();

      expect(authData).toEqual({
        accessTokenExpirationDate: expect.any(Number),
        idToken: 'mock_id_token',
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

      const user = service['getUser']();

      expect(user).toEqual(mockDecodedToken);
      expect(jwtDecode).toHaveBeenCalledWith('mock_token');
    });

    it('should return decoded user data', () => {
      (jwtDecode as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      service['setAuthData']({
        access_token: 'test_token',
        id_token: 'mock_id_token',
        expires_in: '3600',
      });

      expect(service.getUserInfo()).toEqual({
        description: '',
        email: '',
        icon: false,
        initials: '',
        name: ' ',
        picture: '',
        userId: '',
      });
    });

    it('should return an empty object if no auth data', () => {
      jest.spyOn(service, 'getAuthData').mockReturnValue(undefined as any);

      const user = service['getUser']();

      expect(user).toEqual({});
    });
  });

  describe('getUsername', () => {
    it('should return the sub from the decoded token', () => {
      jest
        .spyOn(service as any, 'getUser')
        .mockReturnValue({ sub: 'user123' } as UserTokenData);

      const { userId } = service.getUserInfo();

      expect(userId).toBe('user123');
    });
  });

  describe('getUserEmail', () => {
    it('should return the mail from the decoded token', () => {
      jest
        .spyOn(service as any, 'getUser')
        .mockReturnValue({ mail: 'user@example.com' } as UserTokenData);

      const { email } = service.getUserInfo();

      expect(email).toBe('user@example.com');
    });
  });

  describe('getUserInfo', () => {
    it('should return user info object', () => {
      jest.spyOn(service as any, 'getUser').mockReturnValue({
        first_name: 'John',
        last_name: 'Doe',
        mail: 'john.doe@example.com',
        sub: 'user123',
      } as UserTokenData);

      const userInfo = service.getUserInfo();

      expect(userInfo).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
        description: 'john.doe@example.com',
        picture: '',
        userId: 'user123',
        icon: false,
        initials: 'JD',
      });
    });

    it('should handle undefined first name and last name', () => {
      jest.spyOn(service as any, 'getUser').mockReturnValue({
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
        userId: 'user123',
      });
    });
  });

  describe('authEvents', () => {
    it('should return an Observable', () => {
      expect(service.authEvents).toBeInstanceOf(Observable);
    });

    it('should emit auth events when authEvent is called', (done) => {
      const expectedEvents = [AuthEvent.AUTH_SUCCESSFUL, AuthEvent.AUTH_ERROR];

      service.authEvents.pipe(take(2), toArray()).subscribe((events) => {
        expect(events).toEqual(expectedEvents);
        done();
      });

      service.authEvent(AuthEvent.AUTH_SUCCESSFUL);
      service.authEvent(AuthEvent.AUTH_ERROR);
    });

    it('should not emit events before authEvent is called', (done) => {
      let emitted = false;

      service.authEvents.pipe(take(1)).subscribe(() => {
        emitted = true;
      });

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 100);
    });
  });

  describe('authEvent', () => {
    it('should emit the provided AuthEvent', (done) => {
      const testEvent = AuthEvent.AUTH_EXPIRED;

      service.authEvents.pipe(take(1)).subscribe((event) => {
        expect(event).toBe(testEvent);
        done();
      });

      service.authEvent(testEvent);
    });

    it('should emit multiple events in the order they are called', (done) => {
      const expectedEvents = [
        AuthEvent.AUTH_SUCCESSFUL,
        AuthEvent.AUTH_EXPIRE_SOON,
        AuthEvent.AUTH_EXPIRED,
      ];

      service.authEvents.pipe(take(3), toArray()).subscribe((events) => {
        expect(events).toEqual(expectedEvents);
        done();
      });

      expectedEvents.forEach((event) => service.authEvent(event));
    });
  });

  describe('Multiple subscribers', () => {
    it('should emit events to all subscribers', (done) => {
      const testEvent = AuthEvent.AUTH_SUCCESSFUL;
      let subscriber1Received = false;
      let subscriber2Received = false;

      service.authEvents.pipe(take(1)).subscribe((event) => {
        expect(event).toBe(testEvent);
        subscriber1Received = true;
        if (subscriber2Received) done();
      });

      service.authEvents.pipe(take(1)).subscribe((event) => {
        expect(event).toBe(testEvent);
        subscriber2Received = true;
        if (subscriber1Received) done();
      });

      service.authEvent(testEvent);
    });
  });
});

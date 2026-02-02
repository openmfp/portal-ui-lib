import {
  AuthData,
  AuthEvent,
  AuthTokenData,
  UserTokenData,
} from '../../models';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Observable, firstValueFrom, of, take, toArray } from 'rxjs';
import {
  MockedFunction,
  MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let httpClientMock: MockedObject<HttpClient>;

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
      get: vi.fn(),
    } as any;

    service = new AuthService(httpClientMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('refresh', () => {
    it('should make a POST request and set auth data', async () => {
      const mockResponse: AuthTokenData = {
        access_token: 'mock_access_token',
        id_token: 'mock_id_token',
        expires_in: '3600',
      };
      httpClientMock.post.mockReturnValue(of(mockResponse));

      await service.refresh();

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/rest/auth/refresh',
        {},
      );
      expect(service.getAuthData()).toEqual({
        accessTokenExpirationDate: expect.any(Number),
        idToken: 'mock_id_token',
      });
    });

    it('should make a POST request and not set auth data', async () => {
      const mockResponse: AuthTokenData = undefined as any;
      httpClientMock.post.mockReturnValue(of(mockResponse));

      await service.refresh();

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/rest/auth/refresh',
        {},
      );
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
      vi.spyOn(service, 'getAuthData').mockReturnValue(mockAuthData);

      const token = service.getToken();

      expect(token).toBe('mock_token');
    });

    it('should return an empty object if no auth data', () => {
      vi.spyOn(service, 'getAuthData').mockReturnValue(undefined as any);

      const token = service.getToken();

      expect(token).toEqual({});
    });
  });

  describe('getUser', () => {
    it('should return decoded token if auth data exists', () => {
      const mockDecodedToken = { sub: 'user123' };
      (jwtDecode as MockedFunction<typeof jwtDecode>).mockReturnValue(
        mockDecodedToken,
      );

      const mockAuthData: AuthData = {
        accessTokenExpirationDate: 123456789,
        idToken: 'mock_token',
      };
      vi.spyOn(service, 'getAuthData').mockReturnValue(mockAuthData);

      const user = service['getUser']();

      expect(user).toEqual(mockDecodedToken);
      expect(jwtDecode).toHaveBeenCalledWith('mock_token');
    });

    it('should return decoded user data', () => {
      (jwtDecode as MockedFunction<typeof jwtDecode>).mockImplementationOnce(
        () => {
          throw new Error('Invalid token');
        },
      );
      service['setAuthData']({
        access_token: 'test_token',
        id_token: 'mock_id_token',
        expires_in: '3600',
      });

      expect(service.getUserInfo()).toEqual({
        description: '',
        email: '',
        initials: '',
        name: ' ',
        userId: '',
      });
    });

    it('should return an empty object if no auth data', () => {
      vi.spyOn(service, 'getAuthData').mockReturnValue(undefined as any);

      const user = service['getUser']();

      expect(user).toEqual({});
    });
  });

  describe('getUsername', () => {
    it('should return the sub from the decoded token', () => {
      vi.spyOn(service as any, 'getUser').mockReturnValue({
        sub: 'user123',
      } as UserTokenData);

      const { userId } = service.getUserInfo();

      expect(userId).toBe('user123');
    });
  });

  describe('getUserEmail', () => {
    it('should return the mail from the decoded token', () => {
      vi.spyOn(service as any, 'getUser').mockReturnValue({
        mail: 'user@example.com',
      } as UserTokenData);

      const { email } = service.getUserInfo();

      expect(email).toBe('user@example.com');
    });
  });

  describe('getUserInfo', () => {
    it('should return user info object', () => {
      vi.spyOn(service as any, 'getUser').mockReturnValue({
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
        userId: 'user123',
        initials: 'JD',
      });
    });

    it('should handle undefined first name and last name', () => {
      vi.spyOn(service as any, 'getUser').mockReturnValue({
        mail: 'john.doe@example.com',
        sub: 'user123',
      } as UserTokenData);

      const userInfo = service.getUserInfo();

      expect(userInfo).toEqual({
        name: ' ',
        email: 'john.doe@example.com',
        description: 'john.doe@example.com',
        initials: '',
        userId: 'user123',
      });
    });
  });

  describe('authEvents', () => {
    it('should return an Observable', () => {
      expect(service.authEvents).toBeInstanceOf(Observable);
    });

    it('should emit auth events when authEvent is called', async () => {
      const expectedEvents = [AuthEvent.AUTH_SUCCESSFUL, AuthEvent.AUTH_ERROR];

      const eventsPromise = firstValueFrom(
        service.authEvents.pipe(take(2), toArray()),
      );

      service.authEvent(AuthEvent.AUTH_SUCCESSFUL);
      service.authEvent(AuthEvent.AUTH_ERROR);

      const events = await eventsPromise;
      expect(events).toEqual(expectedEvents);
    });

    it('should not emit events before authEvent is called', async () => {
      let emitted = false;

      service.authEvents.pipe(take(1)).subscribe(() => {
        emitted = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(emitted).toBe(false);
    });
  });

  describe('authEvent', () => {
    it('should emit the provided AuthEvent', async () => {
      const testEvent = AuthEvent.AUTH_EXPIRED;

      const eventPromise = firstValueFrom(service.authEvents.pipe(take(1)));

      service.authEvent(testEvent);

      const event = await eventPromise;
      expect(event).toBe(testEvent);
    });

    it('should emit multiple events in the order they are called', async () => {
      const expectedEvents = [
        AuthEvent.AUTH_SUCCESSFUL,
        AuthEvent.AUTH_EXPIRE_SOON,
        AuthEvent.AUTH_EXPIRED,
      ];

      const eventsPromise = firstValueFrom(
        service.authEvents.pipe(take(3), toArray()),
      );

      expectedEvents.forEach((event) => service.authEvent(event));

      const events = await eventsPromise;
      expect(events).toEqual(expectedEvents);
    });
  });

  describe('Multiple subscribers', () => {
    it('should emit events to all subscribers', async () => {
      const testEvent = AuthEvent.AUTH_SUCCESSFUL;
      const subscriber1Promise = firstValueFrom(
        service.authEvents.pipe(take(1)),
      );
      const subscriber2Promise = firstValueFrom(
        service.authEvents.pipe(take(1)),
      );

      service.authEvent(testEvent);

      const [subscriber1Event, subscriber2Event] = await Promise.all([
        subscriber1Promise,
        subscriber2Promise,
      ]);

      expect(subscriber1Event).toBe(testEvent);
      expect(subscriber2Event).toBe(testEvent);
    });
  });
});

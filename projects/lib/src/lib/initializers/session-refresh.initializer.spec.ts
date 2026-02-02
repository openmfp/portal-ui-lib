import { AuthEvent } from '../models';
import {
  AuthService,
  LuigiCoreService,
  SessionRefreshService,
} from '../services';
import {
  initializeAutomaticSessionRefresh,
  provideSessionRefresh,
} from './session-refresh.initializer';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  MockedObject,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mock } from 'vitest-mock-extended';

const flush = async () => {
  return await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('Session Refresh Provider', () => {
  let authServiceMock: MockedObject<AuthService>;
  let sessionRefreshServiceMock: MockedObject<SessionRefreshService>;
  let luigiCoreServiceMock: MockedObject<LuigiCoreService>;
  let authEventsSubject: Subject<AuthEvent>;

  beforeEach(() => {
    authEventsSubject = new Subject<AuthEvent>();
    sessionRefreshServiceMock = mock<SessionRefreshService>();
    luigiCoreServiceMock = mock<LuigiCoreService>();
    luigiCoreServiceMock.isFeatureToggleActive = vi.fn().mockReturnValue(true);

    authServiceMock = {
      authEvents: authEventsSubject.asObservable(),
    } as any;

    // Configure TestBed with the provider and mocked services
    TestBed.configureTestingModule({
      providers: [
        provideSessionRefresh(),
        { provide: SessionRefreshService, useValue: sessionRefreshServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    initializeAutomaticSessionRefresh(
      sessionRefreshServiceMock,
      authServiceMock,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Session refresh initialization', () => {
    it('should subscribe and handle AUTH_EXPIRE_SOON event', async () => {
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await flush();

      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    });

    it('should not call refresh for other auth events', async () => {
      authEventsSubject.next(AuthEvent.AUTH_REFRESHED);
      await flush();

      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    });

    it('should handle refresh failures gracefully', async () => {
      const error = new Error('Refresh failed');
      sessionRefreshServiceMock.refresh.mockRejectedValueOnce(error);
      console.error = vi.fn();

      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await flush();

      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Error executing session refresh: ',
        error,
      );
    });

    it('should maintain subscription for multiple events when feature is enabled', async () => {
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await flush();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await flush();

      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(2);
    });

    it('should complete subscription when subject is completed', async () => {
      authEventsSubject.complete();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await flush();

      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    });
  });
});

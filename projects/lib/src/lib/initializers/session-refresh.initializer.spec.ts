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
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { Subject } from 'rxjs';

describe('Session Refresh Provider', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let sessionRefreshServiceMock: jest.Mocked<SessionRefreshService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let authEventsSubject: Subject<AuthEvent>;

  beforeEach(() => {
    authEventsSubject = new Subject<AuthEvent>();
    sessionRefreshServiceMock = mock<SessionRefreshService>();
    luigiCoreServiceMock = mock<LuigiCoreService>();
    luigiCoreServiceMock.isFeatureToggleActive = jest
      .fn()
      .mockReturnValue(true);

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
    jest.clearAllMocks();
  });

  describe('Session refresh initialization', () => {
    it('should subscribe and handle AUTH_EXPIRE_SOON event', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      tick();

      // Assert
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    }));

    it('should not call refresh for other auth events', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_REFRESHED);
      tick();

      // Assert
      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    }));

    it('should handle refresh failures gracefully', fakeAsync(() => {
      try {
        // Arrange
        const error = new Error('Refresh failed');
        sessionRefreshServiceMock.refresh.mockRejectedValueOnce(error);
        console.error = jest.fn();

        // Act
        authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
        tick();

        // Assert
        expect(sessionRefreshServiceMock.refresh).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Error executing session refresh: Error: Refresh failed',
        );
      } catch {}
    }));

    it('should maintain subscription for multiple events when feature is enabled', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      tick();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      tick();

      // Assert
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(2);
    }));

    it('should complete subscription when subject is completed', fakeAsync(() => {
      // Act
      authEventsSubject.complete();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      // Wait for async operations
      tick();

      // Assert
      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    }));
  });
});

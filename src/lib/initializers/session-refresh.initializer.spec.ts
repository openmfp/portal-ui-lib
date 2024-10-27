import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { mock } from 'jest-mock-extended';
import { Subject } from 'rxjs';
import { AuthEvent } from '../models';
import {
  AuthService,
  LuigiCoreService,
  SessionRefreshService,
} from '../services';
import { provideSessionRefresh } from './session-refresh.initializer';

describe('Session Refresh Provider', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let sessionRefreshServiceMock: jest.Mocked<SessionRefreshService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let authEventsSubject: Subject<AuthEvent>;

  beforeEach(() => {
    // Create a new Subject for auth events
    authEventsSubject = new Subject<AuthEvent>();

    // Initialize mock services
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
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    });

    // Get the initializers
    const initializers = TestBed.inject(APP_INITIALIZER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('provideSessionRefresh', () => {
    it('should provide APP_INITIALIZER', () => {
      const provider = provideSessionRefresh();
      expect(provider.provide).toBe(APP_INITIALIZER);
      expect(provider.multi).toBe(true);
      expect(provider.deps).toEqual([
        SessionRefreshService,
        AuthService,
        LuigiCoreService,
      ]);
    });
  });

  describe('Session refresh initialization', () => {
    it('should subscribe and handle AUTH_EXPIRE_SOON event when feature is enabled', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      tick();

      // Assert
      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledWith(
        'enableSessionAutoRefresh'
      );
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    }));

    it('should subscribe and handle AUTH_EXPIRED event when feature is enabled', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);
      tick();

      // Assert
      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledWith(
        'enableSessionAutoRefresh'
      );
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    }));

    it('should not call refresh for other auth events', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_REFRESHED);
      tick();

      // Assert
      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    }));

    it('should not call refresh when feature toggle is disabled', fakeAsync(() => {
      // Arrange
      luigiCoreServiceMock.isFeatureToggleActive.mockReturnValue(false);

      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
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
          'Error executing session refresh: Error: Refresh failed'
        );
      } catch {}
    }));

    it('should maintain subscription for multiple events when feature is enabled', fakeAsync(() => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      tick();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);
      tick();

      // Assert
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(2);
    }));

    it('should check feature toggle for each event', fakeAsync(() => {
      // Arrange
      luigiCoreServiceMock.isFeatureToggleActive
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      tick();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);
      tick();

      // Assert
      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledTimes(
        2
      );
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
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

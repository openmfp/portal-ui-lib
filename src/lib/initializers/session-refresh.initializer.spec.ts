import { TestBed } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
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
  let initializerFn: Function;

  beforeEach(() => {
    // Create a new Subject for auth events
    authEventsSubject = new Subject<AuthEvent>();

    // Initialize mock services
    sessionRefreshServiceMock = {
      refresh: jest.fn().mockResolvedValue(undefined),
    } as any;

    authServiceMock = {
      authEvents: authEventsSubject.asObservable(),
    } as any;

    luigiCoreServiceMock = {
      isFeatureToggleActive: jest.fn().mockReturnValue(true),
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

    // Get the initializer function from the provider
    const initializers = TestBed.inject(APP_INITIALIZER);
    initializerFn = initializers[initializers.length - 1];
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
    it('should subscribe and handle AUTH_EXPIRE_SOON event when feature is enabled', async () => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assert
      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledWith(
        'enableSessionAutoRefresh'
      );
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    });

    it('should subscribe and handle AUTH_EXPIRED event when feature is enabled', async () => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assert
      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledWith(
        'enableSessionAutoRefresh'
      );
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    });

    it('should not call refresh for other auth events', async () => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_REFRESHED);

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assert
      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    });

    it('should not call refresh when feature toggle is disabled', async () => {
      // Arrange
      luigiCoreServiceMock.isFeatureToggleActive.mockReturnValue(false);

      // Act
      initializerFn();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assert
      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    });

    it('should handle refresh failures gracefully', async () => {
      // Arrange
      const error = new Error('Refresh failed');
      sessionRefreshServiceMock.refresh.mockRejectedValueOnce(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      initializerFn();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assert
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should maintain subscription for multiple events when feature is enabled', async () => {
      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await new Promise(process.nextTick);
      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);
      await new Promise(process.nextTick);

      // Assert
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(2);
    });

    it('should check feature toggle for each event', async () => {
      // Arrange
      luigiCoreServiceMock.isFeatureToggleActive
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      // Act
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);
      await new Promise(process.nextTick);
      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);
      await new Promise(process.nextTick);

      // Assert
      expect(luigiCoreServiceMock.isFeatureToggleActive).toHaveBeenCalledTimes(
        2
      );
      expect(sessionRefreshServiceMock.refresh).toHaveBeenCalledTimes(1);
    });

    it('should complete subscription when subject is completed', async () => {
      // Act
      initializerFn();
      authEventsSubject.complete();
      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      // Wait for async operations
      await new Promise(process.nextTick);

      // Assert
      expect(sessionRefreshServiceMock.refresh).not.toHaveBeenCalled();
    });
  });
});

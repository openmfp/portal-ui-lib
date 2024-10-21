import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { SessionRefreshService } from './session-refresh.service';
import { AuthService } from '../portal';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthEvent } from '../../models';

describe('SessionRefreshService', () => {
  let service: SessionRefreshService;
  let authServiceMock: jest.Mocked<AuthService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let authEventsSubject: Subject<AuthEvent>;

  beforeEach(() => {
    authEventsSubject = new Subject<AuthEvent>();

    authServiceMock = {
      authEvents: authEventsSubject.asObservable(),
      authEvent: jest.fn(),
      refresh: jest.fn().mockResolvedValue(undefined),
      getAuthData: jest.fn().mockReturnValue({ token: 'mock-token' }),
    } as any;

    luigiCoreServiceMock = {
      isFeatureToggleActive: jest.fn().mockReturnValue(true),
      setAuthData: jest.fn(),
      resetLuigi: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        SessionRefreshService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    });

    service = TestBed.inject(SessionRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refresh', () => {
    it('should not subscribe if already subscribed', () => {
      authServiceMock.authEvents.subscribe = jest.fn();

      service.refresh();
      service.refresh();

      expect(authServiceMock.authEvents.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to authEvents and filter relevant events', (done) => {
      service.refresh();

      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      setTimeout(() => {
        expect(authServiceMock.refresh).toHaveBeenCalled();
        expect(authServiceMock.authEvent).toHaveBeenCalledWith(
          AuthEvent.AUTH_REFRESHED
        );
        expect(luigiCoreServiceMock.setAuthData).toHaveBeenCalled();
        expect(luigiCoreServiceMock.resetLuigi).toHaveBeenCalled();
        done();
      });
    });

    it('should not refresh if feature toggle is off', (done) => {
      luigiCoreServiceMock.isFeatureToggleActive.mockReturnValue(false);
      service.refresh();

      authEventsSubject.next(AuthEvent.AUTH_EXPIRE_SOON);

      setTimeout(() => {
        expect(authServiceMock.refresh).not.toHaveBeenCalled();
        expect(luigiCoreServiceMock.setAuthData).not.toHaveBeenCalled();
        expect(luigiCoreServiceMock.resetLuigi).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle AUTH_EXPIRED event', (done) => {
      service.refresh();

      authEventsSubject.next(AuthEvent.AUTH_EXPIRED);

      setTimeout(() => {
        expect(authServiceMock.refresh).toHaveBeenCalled();
        expect(luigiCoreServiceMock.setAuthData).toHaveBeenCalled();
        expect(luigiCoreServiceMock.resetLuigi).toHaveBeenCalled();
        done();
      });
    });

    it('should not react to unrelated auth events', (done) => {
      service.refresh();

      authEventsSubject.next(AuthEvent.AUTH_SUCCESSFUL);

      setTimeout(() => {
        expect(authServiceMock.refresh).not.toHaveBeenCalled();
        expect(luigiCoreServiceMock.setAuthData).not.toHaveBeenCalled();
        expect(luigiCoreServiceMock.resetLuigi).not.toHaveBeenCalled();
        done();
      });
    });
  });
});

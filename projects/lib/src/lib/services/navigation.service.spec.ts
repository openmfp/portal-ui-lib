import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavigationService } from './navigation.service';
import { AuthService } from './portal';
import { LoginEventService, LoginEventType } from './login-event.service';
import { AuthEvent } from '../models';
import { LocalStorageKeys } from './storage-service';

describe('NavigationService', () => {
  let service: NavigationService;
  let router: jest.Mocked<Router>;
  let authService: jest.Mocked<AuthService>;
  let loginEventService: jest.Mocked<LoginEventService>;
  let routerEvents: Subject<any>;
  let authEvents: Subject<AuthEvent>;
  let loginEvents: Subject<any>;

  beforeEach(() => {
    routerEvents = new Subject<any>();
    authEvents = new Subject<AuthEvent>();
    loginEvents = new Subject<any>();

    router = {
      events: routerEvents.asObservable(),
      navigate: jest.fn(),
    } as any;

    authService = {
      authEvents: authEvents.asObservable(),
    } as any;

    loginEventService = {
      loginEvents: loginEvents.asObservable(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: LoginEventService, useValue: loginEventService },
      ],
    });

    service = TestBed.inject(NavigationService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('track', () => {
    beforeEach(() => {
      service.track();
    });

    it('should track current URL on NavigationEnd', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test-url', '/test-url');
      routerEvents.next(navigationEndEvent);

      authEvents.next(AuthEvent.AUTH_EXPIRED);
      expect(localStorage.getItem('openmfp.navigation.lastUrl')).toBe(
        '/test-url'
      );
    });

    it('should save current URL on AUTH_EXPIRED event', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test-url', '/test-url');
      routerEvents.next(navigationEndEvent);
      authEvents.next(AuthEvent.AUTH_EXPIRED);

      expect(localStorage.getItem('openmfp.navigation.lastUrl')).toBe(
        '/test-url'
      );
    });

    it('should navigate to saved URL and clear it on LOGIN_TRIGGERED', () => {
      localStorage.setItem('openmfp.navigation.lastUrl', '/saved-url');

      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: { param: 'value' },
      });

      expect(router.navigate).toHaveBeenCalledWith(['/saved-url'], {
        queryParams: { param: 'value' },
      });
      expect(localStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        ''
      );
    });

    it('should navigate to root if no saved URL on LOGIN_TRIGGERED', () => {
      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: { param: 'value' },
      });

      expect(router.navigate).toHaveBeenCalledWith(['/'], {
        queryParams: { param: 'value' },
      });
    });

    it('should navigate to logout on LOGOUT_TRIGGERED', () => {
      const queryParams = { param: 'value' };
      loginEvents.next({
        type: LoginEventType.LOGOUT_TRIGGERED,
        queryParams,
      });

      expect(router.navigate).toHaveBeenCalledWith(['/logout'], {
        queryParams,
      });
    });
  });

  describe('private methods behavior', () => {
    beforeEach(() => {
      service.track();
    });

    it('should clear current URL from localStorage', () => {
      localStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, '/test-url');

      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: {},
      });

      expect(localStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        ''
      );
    });

    it('should save current URL to localStorage', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test-url', '/test-url');
      routerEvents.next(navigationEndEvent);
      authEvents.next(AuthEvent.AUTH_EXPIRED);

      expect(localStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        '/test-url'
      );
    });

    it('should get redirect URL from localStorage or return root', () => {
      const savedUrl = '/saved-url';
      localStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, savedUrl);

      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: {},
      });

      expect(router.navigate).toHaveBeenCalledWith([savedUrl], {
        queryParams: {},
      });
    });
  });

  describe('logout behavior', () => {
    beforeEach(() => {
      service.track();
      localStorage.clear();
      (router.navigate as jest.Mock).mockClear();
    });

    it('should save last navigation URL on LOGOUT and then navigate on LOGOUT_TRIGGERED events', () => {
      const navigationStart = new NavigationStart(1, '/current');
      routerEvents.next(navigationStart);

      authEvents.next(AuthEvent.LOGOUT);

      const queryParams = { a: 1 } as any;
      loginEvents.next({
        type: LoginEventType.LOGOUT_TRIGGERED,
        queryParams,
      });

      expect(localStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        '/current'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/logout'], {
        queryParams,
      });
    });
  });
});

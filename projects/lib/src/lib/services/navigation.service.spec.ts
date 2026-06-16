import { NAVIGATION_REDIRECT_STRATEGY_INJECTION_TOKEN } from '../injection-tokens';
import { AuthEvent } from '../models';
import { DefaultNavigationRedirectStrategy } from './navigation-redirect-strategy';
import { LoginEventService, LoginEventType } from './login-event.service';
import { NavigationService } from './navigation.service';
import { AuthService } from './portal';
import { LocalStorageKeys } from './storage-service';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MockedObject } from 'vitest';

/**
 * Build a Map-backed in-memory Storage. Used as a stub for `localStorage`
 * because Node 26's experimental web-storage implementation requires the
 * `--localstorage-file` flag to be set on the runner, which our vitest
 * pipeline doesn't pass — so `globalThis.localStorage` is `undefined` here.
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    key: (i) => Array.from(store.keys())[i] ?? null,
    removeItem: (k) => {
      store.delete(k);
    },
    setItem: (k, v) => {
      store.set(k, String(v));
    },
  };
}

describe('NavigationService', () => {
  let service: NavigationService;
  let router: MockedObject<Router>;
  let authService: MockedObject<AuthService>;
  let loginEventService: MockedObject<LoginEventService>;
  let routerEvents: Subject<any>;
  let authEvents: Subject<AuthEvent>;
  let loginEvents: Subject<any>;
  let memoryStorage: Storage;

  beforeEach(() => {
    routerEvents = new Subject<any>();
    authEvents = new Subject<AuthEvent>();
    loginEvents = new Subject<any>();

    memoryStorage = createMemoryStorage();
    vi.stubGlobal('localStorage', memoryStorage);

    router = {
      events: routerEvents.asObservable(),
      navigate: vi.fn(),
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
        {
          provide: NAVIGATION_REDIRECT_STRATEGY_INJECTION_TOKEN,
          useClass: DefaultNavigationRedirectStrategy,
        },
      ],
    });

    service = TestBed.inject(NavigationService);
    memoryStorage.clear();
  });

  afterEach(() => {
    memoryStorage.clear();
    vi.unstubAllGlobals();
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
      expect(memoryStorage.getItem('openmfp.navigation.lastUrl')).toBe(
        '/test-url',
      );
    });

    it('should save current URL on AUTH_EXPIRED event', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test-url', '/test-url');
      routerEvents.next(navigationEndEvent);
      authEvents.next(AuthEvent.AUTH_EXPIRED);

      expect(memoryStorage.getItem('openmfp.navigation.lastUrl')).toBe(
        '/test-url',
      );
    });

    it('should navigate to saved URL and clear it on LOGIN_TRIGGERED', () => {
      memoryStorage.setItem('openmfp.navigation.lastUrl', '/saved-url');

      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: { param: 'value' },
      });

      expect(router.navigate).toHaveBeenCalledWith(['/saved-url'], {
        queryParams: { param: 'value' },
      });
      expect(memoryStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        '',
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
  });

  describe('private methods behavior', () => {
    beforeEach(() => {
      service.track();
    });

    it('should clear current URL from localStorage', () => {
      memoryStorage.setItem(
        LocalStorageKeys.LAST_NAVIGATION_URL,
        '/test-url',
      );

      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: {},
      });

      expect(memoryStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        '',
      );
    });

    it('should save current URL to localStorage', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test-url', '/test-url');
      routerEvents.next(navigationEndEvent);
      authEvents.next(AuthEvent.AUTH_EXPIRED);

      expect(memoryStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL)).toBe(
        '/test-url',
      );
    });

    it('should get redirect URL from localStorage or return root', () => {
      const savedUrl = '/saved-url';
      memoryStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, savedUrl);

      loginEvents.next({
        type: LoginEventType.LOGIN_TRIGGERED,
        queryParams: {},
      });

      expect(router.navigate).toHaveBeenCalledWith([savedUrl], {
        queryParams: {},
      });
    });
  });
});

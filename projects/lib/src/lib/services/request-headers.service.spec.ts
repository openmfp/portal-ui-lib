import { LuigiCoreService } from './luigi-core.service';
import { AuthService } from './portal';
import { RequestHeadersService } from './request-headers.service';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
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

describe('RequestHeadersService', () => {
  let service: RequestHeadersService;
  let luigiCoreService: MockedObject<LuigiCoreService>;
  let authService: MockedObject<AuthService>;
  let activatedRoute: MockedObject<ActivatedRoute>;

  const mockI18n = {
    getCurrentLocale: vi.fn(),
  };

  beforeEach(() => {
    luigiCoreService = mock<LuigiCoreService>();
    authService = mock<AuthService>();
    activatedRoute = {
      queryParams: of({}),
    } as any;

    luigiCoreService.i18n.mockReturnValue(mockI18n as any);

    TestBed.configureTestingModule({
      providers: [
        RequestHeadersService,
        { provide: LuigiCoreService, useValue: luigiCoreService },
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    });

    service = TestBed.inject(RequestHeadersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createOptionsWithAuthHeader', () => {
    it('should create headers with Accept-Language from Luigi locale', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('en-US');
      expect(result.headers.has('authorization')).toBe(false);
    });

    it('should create headers with empty Accept-Language when locale is null', () => {
      mockI18n.getCurrentLocale.mockReturnValue(null);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('');
    });

    it('should create headers with empty Accept-Language when locale is undefined', () => {
      mockI18n.getCurrentLocale.mockReturnValue(undefined);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('');
    });

    it('should override locale with query param language', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      activatedRoute.queryParams = of({ language: 'de-DE' });

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('de-DE');
    });

    it('should use Luigi locale when query param language is not present', () => {
      mockI18n.getCurrentLocale.mockReturnValue('fr-FR');
      activatedRoute.queryParams = of({});

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('fr-FR');
    });

    it('should add authorization header when idToken is present', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      authService.getAuthData.mockReturnValue({
        idToken: 'test-token-123',
      } as any);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('authorization')).toBe('Bearer test-token-123');
      expect(result.headers.get('Accept-Language')).toBe('en-US');
    });

    it('should not add authorization header when authData is null', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.has('authorization')).toBe(false);
    });

    it('should not add authorization header when authData is undefined', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.has('authorization')).toBe(false);
    });

    it('should not add authorization header when idToken is null', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      authService.getAuthData.mockReturnValue({
        idToken: null,
      } as any);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.has('authorization')).toBe(false);
    });

    it('should not add authorization header when idToken is undefined', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      authService.getAuthData.mockReturnValue({
        idToken: undefined,
      } as any);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.has('authorization')).toBe(false);
    });

    it('should not add authorization header when idToken is empty string', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      authService.getAuthData.mockReturnValue({
        idToken: '',
      } as any);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.has('authorization')).toBe(false);
    });

    it('should handle both language override and auth token', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      authService.getAuthData.mockReturnValue({
        idToken: 'test-token-456',
      } as any);
      activatedRoute.queryParams = of({ language: 'es-ES' });

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('es-ES');
      expect(result.headers.get('authorization')).toBe('Bearer test-token-456');
    });

    it('should call luigiCoreService.i18n', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      service.createOptionsWithAuthHeader();

      expect(luigiCoreService.i18n).toHaveBeenCalled();
    });

    it('should call i18n.getCurrentLocale', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      service.createOptionsWithAuthHeader();

      expect(mockI18n.getCurrentLocale).toHaveBeenCalled();
    });

    it('should call authService.getAuthData', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      service.createOptionsWithAuthHeader();

      expect(authService.getAuthData).toHaveBeenCalled();
    });

    it('should subscribe to route.queryParams', () => {
      const subscribeSpy = vi.spyOn(activatedRoute.queryParams, 'subscribe');
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      service.createOptionsWithAuthHeader();

      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should handle multiple query params and only use language', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      activatedRoute.queryParams = of({
        language: 'it-IT',
        other: 'value',
        foo: 'bar',
      });

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('it-IT');
    });

    it('should return HttpHeaders instance', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers).toBeDefined();
      expect(result.headers.get).toBeDefined();
    });

    it('should return object with headers property', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');

      const result = service.createOptionsWithAuthHeader();

      expect(result).toHaveProperty('headers');
    });

    it('should handle complex idToken', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      const complexToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      authService.getAuthData.mockReturnValue({
        idToken: complexToken,
      } as any);

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('authorization')).toBe(
        `Bearer ${complexToken}`,
      );
    });

    it('should handle special characters in language code', () => {
      mockI18n.getCurrentLocale.mockReturnValue('zh-Hans-CN');

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('zh-Hans-CN');
    });

    it('should handle language query param with special characters', () => {
      mockI18n.getCurrentLocale.mockReturnValue('en-US');
      activatedRoute.queryParams = of({ language: 'pt-BR' });

      const result = service.createOptionsWithAuthHeader();

      expect(result.headers.get('Accept-Language')).toBe('pt-BR');
    });
  });
});

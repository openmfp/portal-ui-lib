import { LuigiCoreService } from './luigi-core.service';
import { RequestHeadersService } from './request-headers.service';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';

describe('RequestHeadersService', () => {
  let service: RequestHeadersService;
  let luigiCoreService: LuigiCoreService;
  let route: ActivatedRoute;
  let getLuigiCoreAuthSpy;
  let i18nSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
    });
    service = TestBed.inject(RequestHeadersService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    route = TestBed.inject(ActivatedRoute);

    getLuigiCoreAuthSpy = jest.spyOn(luigiCoreService, 'getAuthData');
    getLuigiCoreAuthSpy.mockReturnValue({ idToken: 'some_idtoken' });

    i18nSpy = jest.spyOn(luigiCoreService, 'i18n');
    i18nSpy.mockReturnValue({
      getCurrentLocale: () => {
        return 'en';
      },
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use the language from LuigiCoreService when no query param is present', () => {
    const result = service.createOptionsWithAuthHeader();

    expect(result.headers.get('Accept-Language')).toBe('en');
    expect(result.headers.get('authorization')).toBe('Bearer some_idtoken');
  });

  it('should use the language from query params when present', (done) => {
    route.queryParams = of({ language: 'pl' });

    const result = service.createOptionsWithAuthHeader();

    setTimeout(() => {
      expect(result.headers.get('Accept-Language')).toBe('pl');
      expect(result.headers.get('authorization')).toBe('Bearer some_idtoken');
      done();
    });
  });

  it('should create option with auth header', () => {
    const options = service.createOptionsWithAuthHeader();
    expect(options.headers.get('Authorization')).toBe('Bearer some_idtoken');
  });

  it('should return headers without authorization if not authenticated', () => {
    getLuigiCoreAuthSpy.mockReturnValue({});
    const options = service.createOptionsWithAuthHeader();
    expect(options.headers.get('Authorization')).toBeNull();
  });
});

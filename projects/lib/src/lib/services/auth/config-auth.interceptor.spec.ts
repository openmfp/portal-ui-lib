import { AuthService } from '../portal';
import { configAuthInterceptor } from './config-auth.interceptor';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';

describe('configAuthInterceptor', () => {
  let authService: MockedObject<AuthService>;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    authService = {
      getToken: vi.fn(),
      refresh: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        provideHttpClient(withInterceptors([configAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('waits for session recovery before it sends a config request', () => {
    authService.getToken
      .mockReturnValueOnce(undefined)
      .mockReturnValue('restored-token');
    authService.refresh.mockResolvedValue({} as any);

    TestBed.inject(HttpClient).get('/rest/config').subscribe();

    return vi.waitFor(() => {
      const request = httpTestingController.expectOne('/rest/config');
      expect(request.request.headers.get('authorization')).toBe(
        'Bearer restored-token',
      );
      expect(authService.refresh).toHaveBeenCalledOnce();
      request.flush({});
    });
  });

  it('does not refresh for another endpoint', () => {
    TestBed.inject(HttpClient).get('/rest/envconfig').subscribe();

    const request = httpTestingController.expectOne('/rest/envconfig');
    expect(authService.refresh).not.toHaveBeenCalled();
    request.flush({});
  });

  it('keeps an authenticated config request unchanged', () => {
    authService.getToken.mockReturnValue('existing-token');

    TestBed.inject(HttpClient)
      .get('/rest/config', {
        headers: { authorization: 'Bearer existing-token' },
      })
      .subscribe();

    const request = httpTestingController.expectOne('/rest/config');
    expect(request.request.headers.get('authorization')).toBe(
      'Bearer existing-token',
    );
    expect(authService.refresh).not.toHaveBeenCalled();
    request.flush({});
  });
});

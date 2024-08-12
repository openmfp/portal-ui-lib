import { TestBed } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { EnvConfigService } from './env-config.service';

describe('EnvConfigService', () => {
  let service: EnvConfigService;
  let authServiceMock: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    authServiceMock = { setAuthData: jest.fn() } as any as AuthService;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).overrideProvider(AuthService, { useValue: authServiceMock });

    service = TestBed.inject(EnvConfigService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the client env config', async () => {
    const clientEnvironmentPromise = service.getEnvConfig();
    const configRequest = http.expectOne('/rest/envconfig');
    const response = { clientId: '123', authData: {} };
    configRequest.flush(response);

    const clientEnvironment = await clientEnvironmentPromise;

    expect(clientEnvironment).toBe(response);
    expect(authServiceMock.setAuthData).toHaveBeenCalledWith(response.authData);
  });
});

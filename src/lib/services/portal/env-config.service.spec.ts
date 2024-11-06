import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { EnvConfigService } from './env-config.service';

describe('EnvConfigService', () => {
  let service: EnvConfigService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EnvConfigService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the client env config', async () => {
    const clientEnvironmentPromise = service.getEnvConfig();
    const configRequest = http.expectOne('/rest/envconfig');
    const response = { clientId: '123' };
    configRequest.flush(response);

    const clientEnvironment = await clientEnvironmentPromise;

    expect(clientEnvironment).toBe(response);
  });
});

import { EnvConfigService } from './env-config.service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

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

  describe('getEnvConfig', () => {
    it('should get the client env config', async () => {
      let clientEnvironmentPromise = service.getEnvConfig();
      const configRequest = http.expectOne('/rest/envconfig');
      const response = { clientId: '123' };
      configRequest.flush(response);

      expect(await clientEnvironmentPromise).toBe(response);

      // Act second call
      clientEnvironmentPromise = service.getEnvConfig();
      http.expectNone('/rest/envconfig');

      expect(await clientEnvironmentPromise).toBe(response);
    });
  });
});

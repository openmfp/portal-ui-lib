import { RequestHeadersService } from '../request-headers.service';
import { ConfigService } from './config.service';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { mock } from 'jest-mock-extended';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [RouterModule.forRoot([])],
    });
    service = TestBed.inject(ConfigService);
    httpTestingController = TestBed.inject(HttpTestingController);
    const requestHeadersService = TestBed.inject(RequestHeadersService);

    jest
      .spyOn(requestHeadersService, 'createOptionsWithAuthHeader')
      .mockReturnValue({
        headers: null,
      });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPortalConfig', () => {
    it('should get the config from cache', async () => {
      // Arrange
      const portalConfig = Promise.resolve({ providers: [] }) as any;
      service['portalConfigCachePromise'] = portalConfig;

      // Act
      const configFromCache = await service.getPortalConfig();

      // Assert
      expect(configFromCache).toEqual(await portalConfig);
    });

    it('should get the config', async () => {
      // Arrange
      const response = {
        providers: [],
      };

      // Act
      const configPromise = service.getPortalConfig();
      const testRequest = httpTestingController.expectOne('/rest/config');
      testRequest.flush(response);
      const config = await configPromise;

      // Assert
      expect(testRequest.request.method).toBe('GET');
      expect(config.providers).toEqual(response.providers);
    });

    it('should handle 403 error', async () => {
      const mockLocation = {
        assign: jest.fn(),
        href: '',
        pathname: '',
        search: '',
        hash: '',
        host: '',
        hostname: '',
        port: '',
        protocol: '',
        origin: '',
        reload: jest.fn(),
        replace: jest.fn(),
        toString: jest.fn(),
      } as any;

      delete window.location;
      window.location = mockLocation;

      const configPromise = service.getPortalConfig();
      const testRequest = httpTestingController.expectOne('/rest/config');
      testRequest.flush({}, { status: 403, statusText: 'Forbidden' });

      await expect(configPromise).rejects.toBeTruthy();
      expect(window.location.assign).toHaveBeenCalledWith(
        '/logout?error=invalidToken',
      );
    });

    it('should get the luigi nodes only once', async () => {
      // Act
      service.getPortalConfig();

      // Assert
      const testRequest = httpTestingController.expectOne('/rest/config');
      testRequest.flush([]);
    });
  });

  describe('clearEntityConfigCache', () => {
    it('should clear entity cache', () => {
      // Arrange
      service['entityConfigCache'] = { project: {} };

      // Act
      service.clearEntityConfigCache();

      // Assert
      expect(service['entityConfigCache']).toEqual({});
    });
  });

  describe('getEntityConfig', () => {
    const projectId = 'projectId';

    it('should get the entity config', async () => {
      // Arrange
      const response = { entityContext: {}, providers: [] };

      // Act
      const configsPromise = service.getEntityConfig('project', {
        project: projectId,
      });
      const testRequest = httpTestingController.expectOne(
        `/rest/config/project?project=${projectId}`,
      );
      testRequest.flush(response);

      // Assert
      expect(testRequest.request.method).toBe('GET');
      expect(await configsPromise).toBe(response);
    });

    it('should handle 403 error', async () => {
      // Act
      const configsPromise = service.getEntityConfig('project', {
        project: projectId,
      });
      const testRequest = httpTestingController.expectOne(
        `/rest/config/project?project=${projectId}`,
      );
      const error403 = { status: 403, statusText: 'Forbidden' };
      testRequest.flush({}, error403);

      // Assert
      try {
        await configsPromise;
      } catch (e) {
        expect(e.status).toEqual(error403.status);
        expect(e.statusText).toEqual('Forbidden');
      }
    });

    it('should get the entity config only once', async () => {
      // Act
      const rawConf1Promise = service.getEntityConfig('project', {
        project: projectId,
      });

      const testRequest = httpTestingController.expectOne(
        '/rest/config/project?project=' + projectId,
      );
      testRequest.flush([]);
      const rawConf1 = await rawConf1Promise;
      const rawConf2 = await service.getEntityConfig('project', {
        project: projectId,
      });
      httpTestingController.expectNone('/rest/config/project/' + projectId);

      // Assert
      expect(rawConf1).toBe(rawConf2);
    });
  });
});

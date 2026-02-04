import { DependenciesVersionsService } from './dependencies-versions.service';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MockedObject } from 'vitest';

describe('DependenciesVersionsService', () => {
  let service: DependenciesVersionsService;
  let httpClient: MockedObject<HttpClient>;

  beforeEach(() => {
    httpClient = {
      get: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        DependenciesVersionsService,
        { provide: HttpClient, useValue: httpClient },
      ],
    });

    service = TestBed.inject(DependenciesVersionsService);
  });

  describe('read', () => {
    it('should fetch dependencies versions from assets', async () => {
      const mockResponse = { angular: '14.0.0', typescript: '4.8.0' };
      httpClient.get.mockReturnValue(of(mockResponse));

      const result = await service.read();

      expect(httpClient.get).toHaveBeenCalledWith(
        '/assets/dependencies-versions.json',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transformVersionsConfig', () => {
    it('should transform version config into structured format', () => {
      const input = {
        angular: '14.0.0',
        typeScript: '4.8.0',
        testFramework: '1.0.0',
      };

      const result = service.transformVersionsConfig(input);

      expect(result).toEqual({
        angular: {
          type: 'string',
          label: 'Angular',
          value: '14.0.0',
          isEditable: false,
        },
        typeScript: {
          type: 'string',
          label: 'Type Script',
          value: '4.8.0',
          isEditable: false,
        },
        testFramework: {
          type: 'string',
          label: 'Test Framework',
          value: '1.0.0',
          isEditable: false,
        },
      });
    });

    it('should handle empty input', () => {
      const result = service.transformVersionsConfig({});
      expect(result).toEqual({});
    });
  });
});

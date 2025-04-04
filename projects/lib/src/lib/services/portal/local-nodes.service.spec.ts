import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { LocalNodesService } from './local-nodes.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { LuigiCoreService } from '../luigi-core.service';

describe('LocalNodesService', () => {
  let service: LocalNodesService;
  let httpTestingController: HttpTestingController;
  let luigiCoreService: LuigiCoreService;
  let i18nSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LuigiCoreService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      imports: [RouterModule.forRoot([])],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LocalNodesService);
    luigiCoreService = TestBed.inject(LuigiCoreService);

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

  it('should return null if called with empty configurations', async () => {
    // Arrange
    const expectedResponse = [];

    // Act
    const getLuigiDataFromConfigurations =
      await service.getLuigiNodesFromConfigurations([]);

    // Assert
    expect(getLuigiDataFromConfigurations).toBeNull();
  });

  it('should get the luigi nodes from configurations', async () => {
    // Arrange
    const expectedResponse = [];

    // Act
    const getLuigiDataFromConfigurationsPromise =
      service.getLuigiNodesFromConfigurations([
        {
          name: 'test',
          creationTimestamp: '',
          luigiConfigFragment: null,
        },
      ]);
    const testRequest = httpTestingController.expectOne('/rest/localnodes');
    testRequest.flush(expectedResponse);
    const response = await getLuigiDataFromConfigurationsPromise;

    // Assert
    expect(response).toBe(expectedResponse);
    expect(testRequest.request.method).toBe('POST');
  });
});

import { TestBed } from '@angular/core/testing';

import { PortalLuigiDataConfigService } from './luigi-data-config.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { DevModeSettings } from './dev-mode/dev-mode-settings';
import { LuigiCoreService } from '../luigi-core.service';

describe('LuigiDataConfigService', () => {
  let service: PortalLuigiDataConfigService;
  let httpTestingController: HttpTestingController;
  let luigiCoreService: LuigiCoreService;
  let i18nSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LuigiCoreService],
      imports: [HttpClientTestingModule, RouterModule.forRoot([])],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PortalLuigiDataConfigService);
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

  it('should get the localnodes', async () => {
    // Arrange
    const expectedResponse = [];
    const devModeSettings: DevModeSettings = {
      configs: [],
      serviceProviderConfig: {}
    };

    // Act
    const getLuigiDataFromConfigurationsPromise = service.getLuigiDataFromConfigurations(devModeSettings);
    const testRequest = httpTestingController.expectOne('/rest/localnodes?language=en&contentConfigurations=%5B%5D');
    testRequest.flush(expectedResponse);
    const response = await getLuigiDataFromConfigurationsPromise;

    // Assert
    expect(response).toBe(expectedResponse);
    expect(testRequest.request.method).toBe('GET');
  });
});

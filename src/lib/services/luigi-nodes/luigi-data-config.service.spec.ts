import { TestBed } from '@angular/core/testing';

import { PortalLuigiDataConfigService } from './luigi-data-config.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { DevModeSettings } from './dev-mode/dev-mode-settings';

describe('LuigiDataConfigService', () => {
  let service: PortalLuigiDataConfigService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterModule.forRoot([])],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PortalLuigiDataConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the localnodes', async () => {
    // Arrange
    const response = [];
    const devModeSettings: DevModeSettings = {
      configs: [],
      serviceProviderConfig: {}
    };

    // Act
    service.getLuigiDataFromConfigurations(devModeSettings);
    const testRequest = httpTestingController.expectOne('/rest/localnodes');
    testRequest.flush(response);

    // Assert
    expect(testRequest.request.method).toBe('GET');
  });
});

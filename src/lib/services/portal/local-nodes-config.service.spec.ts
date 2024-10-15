import { TestBed } from '@angular/core/testing';

import { LocalNodesConfigService } from './local-nodes-config.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { DevModeSettings } from '../luigi-nodes/dev-mode/dev-mode-settings';
import { LuigiCoreService } from '../luigi-core.service';

describe('LocalNodesConfigService', () => {
  let service: LocalNodesConfigService;
  let httpTestingController: HttpTestingController;
  let luigiCoreService: LuigiCoreService;
  let i18nSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LuigiCoreService],
      imports: [HttpClientTestingModule, RouterModule.forRoot([])],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LocalNodesConfigService);
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

  it('should get the luigi nodes from configurations', async () => {
    // Arrange
    const expectedResponse = [];

    // Act
    const getLuigiDataFromConfigurationsPromise = service.getLuigiNodesFromConfigurations([{
      name: 'test',
      creationTimestamp: '',
      luigiConfigFragment: null
    }]);
    const testRequest = httpTestingController.expectOne('/rest/localnodes');
    testRequest.flush(expectedResponse);
    const response = await getLuigiDataFromConfigurationsPromise;

    // Assert
    expect(response).toBe(expectedResponse);
    expect(testRequest.request.method).toBe('POST');
  });
});

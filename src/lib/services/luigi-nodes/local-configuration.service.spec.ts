import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { LocalConfigurationService } from './local-configuration.service';
import { DevModeSettingsService } from './dev-mode/dev-mode-settings.service';
import { LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { NoopLuigiDataConfigService } from './luigi-data-config.service';
import { LUIGI_DATA_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';

describe('LocalConfigurationService', () => {
  let service: LocalConfigurationService;
  let mockLuigiDataConfigService: MockProxy<NoopLuigiDataConfigService>;
  let luigiCoreService: LuigiCoreService;
  let mockDevModeSettingsService: MockProxy<DevModeSettingsService>;

  beforeEach(() => {
    mockDevModeSettingsService = mock<DevModeSettingsService>();
    mockLuigiDataConfigService = mock<NoopLuigiDataConfigService>();
    TestBed.configureTestingModule({
      providers: [
        DevModeSettingsService,
        {
          provide: LUIGI_DATA_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: mockLuigiDataConfigService,
        },
      ],
      imports: [HttpClientTestingModule],
    })
      .overrideProvider(DevModeSettingsService, {
        useValue: mockDevModeSettingsService,
      });
    service = TestBed.inject(LocalConfigurationService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNodes', () => {
    let getLuigiDataFromConfigurationsSpy;
    let i18nSpy;

    beforeEach(() => {
      getLuigiDataFromConfigurationsSpy = jest.spyOn(
        mockLuigiDataConfigService,
        'getLuigiDataFromConfigurations',
      );
      i18nSpy = jest.spyOn(luigiCoreService, 'i18n');
      i18nSpy.mockReturnValue({
        getCurrentLocale: () => {
          return 'en';
        },
      });
    });

    it('should return the nodes for a dev environment if the request is successful', async () => {
      const luigiNodeMock = mock<LuigiNode>();
      getLuigiDataFromConfigurationsSpy.mockResolvedValue([luigiNodeMock]);

      mockDevModeSettingsService.getDevModeSettings.mockReturnValue(
        Promise.resolve({
          serviceProviderConfig: {},
          configs: [{ url: 'sap.com' }],
        }),
      );

      const localNodes = await service.getLocalNodes();

      expect(localNodes).toEqual([luigiNodeMock]);
    });

    it('should apply the serviceProviderConfig to the nodes', async () => {
      const luigiNodeMock: LuigiNode = { viewUrl: 'https://sap.com/test' };
      getLuigiDataFromConfigurationsSpy.mockResolvedValue([luigiNodeMock]);

      mockDevModeSettingsService.getDevModeSettings.mockResolvedValue({
        serviceProviderConfig: {
          a: 'b',
        },
        configs: [{ url: 'sap.com' }],
      });

      const localNodes = await service.getLocalNodes();

      expect(localNodes).toEqual([
        { ...luigiNodeMock, context: { serviceProviderConfig: { a: 'b' } } },
      ]);
    });

    it('should return an empty array for a dev environment if the request fails', async () => {
      getLuigiDataFromConfigurationsSpy.mockResolvedValue([]);

      const localNodes = await service.getLocalNodes();

      expect(localNodes).toEqual([]);
    });
  });
});

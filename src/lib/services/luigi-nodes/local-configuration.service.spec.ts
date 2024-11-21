import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';
import { LocalConfigurationServiceImpl } from './local-configuration.service';
import { DevModeSettingsService } from './dev-mode/dev-mode-settings.service';
import { ContentConfiguration, LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { LocalNodesConfigService } from '../portal';

describe('LocalConfigurationServiceImpl', () => {
  let service: LocalConfigurationServiceImpl;
  let luigiCoreService: LuigiCoreService;
  let httpClient: HttpClient;
  let luigiDataConfigServiceMock: MockProxy<LocalNodesConfigService>;
  let devModeSettingsServiceMock: MockProxy<DevModeSettingsService>;

  beforeEach(() => {
    devModeSettingsServiceMock = mock<DevModeSettingsService>();
    luigiDataConfigServiceMock = mock<LocalNodesConfigService>();
    TestBed.configureTestingModule({
      providers: [
        DevModeSettingsService,
        {
          provide: LocalNodesConfigService,
          useValue: luigiDataConfigServiceMock,
        },
        provideHttpClient(),
      ],
    }).overrideProvider(DevModeSettingsService, {
      useValue: devModeSettingsServiceMock,
    });
    service = TestBed.inject(LocalConfigurationServiceImpl);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLocalNodes', () => {
    it('should cache the result of the first call to retrieve content configuration', async () => {
      // Arrange
      const url = 'http://localhost:8080';
      devModeSettingsServiceMock.getDevModeSettings.mockResolvedValue({
        serviceProviderConfig: {},
        configs: [
          {
            url,
          },
          {
            data: {
              name: 'name-1',
              creationTimestamp: '',
              luigiConfigFragment: {},
            } as ContentConfiguration,
          },
        ],
      });
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockImplementation(
        async (conf: ContentConfiguration[]) => conf.map((c) => ({}))
      );
      httpClient.get = jest.fn().mockReturnValue(of({}));

      // Act
      let result = await service.getLocalNodes();

      // Assert
      expect(result).toHaveLength(2);
      expect(httpClient.get).toHaveBeenCalledWith(url);

      // Act
      result = await service.getLocalNodes();

      // Assert
      expect(result).toHaveLength(2);
      expect(httpClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('replaceServerNodesWithLocalOnes', () => {
    const serverLuigiNodesTest = [
      { pathSegment: '/path', entityType: 'typeA', label: 'A', context: {} },
      { pathSegment: '/path', entityType: 'typeB', label: 'B', context: {} },
    ];

    let getLocalNodesSpy;
    beforeEach(() => {
      getLocalNodesSpy = jest.spyOn(service, 'getLocalNodes');
    });

    it('should return modified nodes', async () => {
      const localNode = {
        pathSegment: '/path',
        entityType: 'typeA',
        label: 'C',
        context: {},
      };
      getLocalNodesSpy.mockResolvedValue([localNode]);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverLuigiNodesTest,
        ['typeA', 'typeB']
      );

      expect(localNodes).toContain(localNode);
    });

    it('should return serverLuigiNodes when localNodes is []', async () => {
      getLocalNodesSpy.mockResolvedValue([]);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverLuigiNodesTest,
        ['typeA', 'typeB']
      );

      expect(localNodes).toEqual(serverLuigiNodesTest);
    });

    it('should return serverLuigiNodes when localNodes is null', async () => {
      getLocalNodesSpy.mockResolvedValue(null);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverLuigiNodesTest,
        ['typeA', 'typeB']
      );

      expect(localNodes).toEqual(serverLuigiNodesTest);
    });
  });

  describe('getNodes', () => {
    let getLuigiDataFromConfigurationsSpy;
    let i18nSpy;

    beforeEach(() => {
      getLuigiDataFromConfigurationsSpy = jest.spyOn(
        luigiDataConfigServiceMock,
        'getLuigiNodesFromConfigurations'
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

      devModeSettingsServiceMock.getDevModeSettings.mockResolvedValue({
        serviceProviderConfig: {},
        configs: [
          {
            data: {
              name: '',
              creationTimestamp: '',
              luigiConfigFragment: {},
            } as ContentConfiguration,
          },
        ],
      });

      const localNodes = await service.getLocalNodes();

      expect(localNodes).toEqual([luigiNodeMock]);
    });

    it('should apply the serviceProviderConfig to the nodes', async () => {
      const luigiNodeMock: LuigiNode = { viewUrl: 'https://sap.com/test' };
      getLuigiDataFromConfigurationsSpy.mockResolvedValue([luigiNodeMock]);

      devModeSettingsServiceMock.getDevModeSettings.mockResolvedValue({
        serviceProviderConfig: {
          a: 'b',
        },
        configs: [
          {
            data: {
              name: '',
              creationTimestamp: '',
              luigiConfigFragment: {},
            } as ContentConfiguration,
          },
        ],
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

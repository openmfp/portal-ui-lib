import { LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { ContentConfiguration, LuigiNode } from '../../models';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LocalNodesService } from '../portal';
import { localDevelopmentSettingsLocalStorage } from '../storage-service';
import {
  LocalConfigurationService,
  LocalConfigurationServiceImpl,
} from './local-configuration.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { of } from 'rxjs';

describe('LocalConfigurationServiceImpl', () => {
  let service: LocalConfigurationServiceImpl;
  let luigiCoreService: LuigiCoreService;
  let httpClient: HttpClient;
  let luigiDataConfigServiceMock: MockProxy<LocalNodesService>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let customLocalConfigurationServiceMock: jest.Mocked<LocalConfigurationService>;

  beforeEach(() => {
    i18nServiceMock = mock();
    customLocalConfigurationServiceMock = mock();
    localDevelopmentSettingsLocalStorage.read = jest.fn();
    luigiDataConfigServiceMock = mock<LocalNodesService>();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalNodesService,
          useValue: luigiDataConfigServiceMock,
        },
        {
          provide: LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
          useValue: customLocalConfigurationServiceMock,
        },
        { provide: I18nService, useValue: i18nServiceMock },
        provideHttpClient(),
      ],
    });
    service = TestBed.inject(LocalConfigurationServiceImpl);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    httpClient = TestBed.inject(HttpClient);
    luigiCoreService.showAlert = jest.fn();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLocalNodes', () => {
    it('should cache the result of the first call to retrieve content configuration', async () => {
      // Arrange
      const url = 'http://localhost:8080';
      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
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
        async (conf: ContentConfiguration[]) => {
          return { nodes: conf.map((c) => ({})) };
        },
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

    it('should call alertErrors when result contains validation errors', async () => {
      // Arrange
      const validationErrors = [{ message: 'Error 1' }, { message: 'Error 2' }];
      const errors = [{ url: 'http://test.com', validationErrors }];
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        {
          errors,
        },
      );

      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
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

      // Act
      await service.getLocalNodes();

      // Assert
      expect(luigiCoreService.showAlert).toHaveBeenCalled();
      expect(luigiCoreService.showAlert).toHaveBeenCalledWith({
        text: expect.stringContaining('Error 1'),
        type: 'error',
      });
    });

    it('should not call alertErrors when result contains no errors', async () => {
      // Arrange
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        {
          nodes: [],
        },
      );

      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
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

      // Act
      await service.getLocalNodes();

      // Assert
      expect(luigiCoreService.showAlert).not.toHaveBeenCalled();
    });

    it('should format multiple validation errors correctly in the alert message', async () => {
      // Arrange
      const validationErrors1 = [
        { message: 'Config 1 Error 1' },
        { message: 'Config 1 Error 2' },
      ];
      const validationErrors2 = [{ message: 'Config 2 Error 1' }];
      const errors = [
        { url: 'http://test1.com', validationErrors: validationErrors1 },
        { url: 'http://test2.com', validationErrors: validationErrors2 },
      ];
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        {
          errors,
        },
      );

      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
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

      // Act
      await service.getLocalNodes();

      // Assert
      expect(luigiCoreService.showAlert).toHaveBeenCalled();
      const alertText = (luigiCoreService.showAlert as any).mock.calls[0][0]
        .text;
      expect(alertText).toContain('http://test1.com');
      expect(alertText).toContain('Config 1 Error 1');
      expect(alertText).toContain('Config 1 Error 2');
      expect(alertText).toContain('http://test2.com');
      expect(alertText).toContain('Config 2 Error 1');
    });
  });

  describe('replaceServerNodesWithLocalOnes', () => {
    const serverLuigiNodesTest = [
      { pathSegment: '/path', entityType: 'typeA', label: 'A', context: {} },
      { pathSegment: '/path', entityType: 'typeB', label: 'B', context: {} },
    ] as LuigiNode[];

    let getLocalNodesSpy;
    beforeEach(() => {
      getLocalNodesSpy = jest.spyOn(service, 'getLocalNodes');
    });

    it('should return compound nodes with global nodes', async () => {
      const localNode = {
        pathSegment: '/path',
        entityType: 'typeA.typeB::compound',
        label: 'C',
        context: {},
      };

      getLocalNodesSpy.mockResolvedValue([localNode]);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverLuigiNodesTest,
        ['global', 'home'],
      );

      expect(localNodes).toContain(localNode);
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
        ['typeA', 'typeB'],
      );

      expect(localNodes).toContain(localNode);
    });

    it('should return serverLuigiNodes when localNodes is []', async () => {
      getLocalNodesSpy.mockResolvedValue([]);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverLuigiNodesTest,
        ['typeA', 'typeB'],
      );

      expect(localNodes).toEqual(serverLuigiNodesTest);
    });

    it('should return empty server nodes when no matching local nodes', async () => {
      const serverNodes = [
        { pathSegment: '/path', entityType: null, label: 'Y', context: {} },
      ] as unknown as LuigiNode[];
      getLocalNodesSpy.mockResolvedValue([
        { pathSegment: '/path', entityType: 'typeX', label: 'X', context: {} },
      ]);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverNodes,
        [],
      );
      expect(localNodes).toEqual(serverNodes);
    });

    it('should return serverLuigiNodes when localNodes is null', async () => {
      getLocalNodesSpy.mockResolvedValue(null);
      const localNodes = await service.replaceServerNodesWithLocalOnes(
        serverLuigiNodesTest,
        ['typeA', 'typeB'],
      );

      expect(localNodes).toEqual(serverLuigiNodesTest);
    });
  });

  describe('getNodes', () => {
    let i18nSpy;

    beforeEach(() => {
      i18nSpy = jest.spyOn(luigiCoreService, 'i18n');
      i18nSpy.mockReturnValue({
        getCurrentLocale: () => {
          return 'en';
        },
      });
    });

    it('should return the nodes for a dev environment if the request is successful', async () => {
      const luigiNodeMock = mock<LuigiNode>();
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        { nodes: [luigiNodeMock] },
      );

      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
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
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        { nodes: [luigiNodeMock] },
      );

      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
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

    it('should return empty array if the local settings is not active', async () => {
      const luigiNodeMock: LuigiNode = { viewUrl: 'https://sap.com/test' };
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        { nodes: [luigiNodeMock] },
      );

      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: false,
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

      expect(localNodes).toEqual([]);
      expect(
        customLocalConfigurationServiceMock.getLocalNodes,
      ).toHaveBeenCalled();
    });

    it('should return an empty array for a dev environment if the request fails', async () => {
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockResolvedValue(
        { nodes: [] },
      );

      const localNodes = await service.getLocalNodes();

      expect(localNodes).toEqual([]);
    });

    it('should return an empty array for a dev environment if the request fails', async () => {
      luigiDataConfigServiceMock.getLuigiNodesFromConfigurations.mockRejectedValue(
        null,
      );
      localDevelopmentSettingsLocalStorage.read = jest.fn().mockReturnValue({
        isActive: true,
      });
      console.warn = jest.fn();

      const localNodes = await service.getLocalNodes();

      expect(localNodes).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Local development ', () => {
    let mockQuerySelector;
    let mockCreateElement;

    beforeEach(() => {
      mockCreateElement = jest.fn();
      mockQuerySelector = jest.fn();

      document.querySelector = mockQuerySelector;
      document.createElement = mockCreateElement;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addLocalDevelopmentModeOnIndicator', () => {
      test('should not add indicator when popover control is not found', () => {
        localDevelopmentSettingsLocalStorage.read = jest
          .fn()
          .mockReturnValue({ isActive: true });
        mockQuerySelector.mockReturnValue(null);

        service.addLocalDevelopmentModeOnIndicator();

        expect(document.createElement).not.toHaveBeenCalled();
      });

      test('should not add indicator when popover control has no parent', () => {
        localDevelopmentSettingsLocalStorage.read = jest
          .fn()
          .mockReturnValue({ isActive: true });
        mockQuerySelector.mockReturnValue({ parentNode: null });

        service.addLocalDevelopmentModeOnIndicator();

        expect(document.createElement).not.toHaveBeenCalled();
      });

      test('should add indicator when local development is active and popover exists', () => {
        const mockSpan = {
          classList: {
            add: jest.fn(),
          },
          title: '',
        };

        const mockParentNode = {
          appendChild: jest.fn(),
        };

        localDevelopmentSettingsLocalStorage.read = jest
          .fn()
          .mockReturnValue({ isActive: true });
        mockQuerySelector.mockReturnValue({ parentNode: mockParentNode });
        mockCreateElement.mockReturnValue(mockSpan);
        i18nServiceMock.getTranslation.mockReturnValue('Translated Text');

        service.addLocalDevelopmentModeOnIndicator();

        new Promise((resolve) => {
          setTimeout(() => {
            expect(document.querySelector).toHaveBeenCalledWith(
              '#profilePopover',
            );
            expect(document.createElement).toHaveBeenCalledWith('span');
            expect(mockSpan.classList.add).toHaveBeenCalledWith(
              'sap-icon--developer-settings',
              'local-development-settings-indication',
            );
            expect(mockSpan.title).toBe('Translated Text');
            expect(mockParentNode.appendChild).toHaveBeenCalledWith(mockSpan);
            resolve(null);
          }, 1001);
        });
      });
    });
  });
});

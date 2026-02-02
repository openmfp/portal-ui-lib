import { ERROR_COMPONENT_CONFIG } from '../../injection-tokens';
import {
  EntityConfig,
  EntityDefinition,
  ErrorComponentConfig,
  LuigiNode,
  NodeContext,
  PortalConfig,
  ServiceProvider,
} from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { ConfigService } from '../portal';
import { LocalConfigurationServiceImpl } from './local-configuration.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MockedObject, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockProxy, mock } from 'vitest-mock-extended';

describe('LuigiNodesService', () => {
  let service: LuigiNodesService;
  let configService: ConfigService;
  let localConfigurationServiceMock: MockedObject<LocalConfigurationServiceImpl>;
  let errorComponentConfig: MockProxy<ErrorComponentConfig>;
  let luigiCoreService: MockedObject<LuigiCoreService>;

  beforeEach(() => {
    errorComponentConfig = mock<ErrorComponentConfig>();
    luigiCoreService = mock<LuigiCoreService>({
      showAlert: vi.fn(),
    });
    localConfigurationServiceMock = mock();
    localConfigurationServiceMock.getLocalNodes.mockResolvedValue([]);
    localConfigurationServiceMock.replaceServerNodesWithLocalOnes.mockImplementation(
      async (serverLuigiNodes: LuigiNode[], currentEntities: string[]) => {
        return serverLuigiNodes;
      },
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalConfigurationServiceImpl,
          useValue: localConfigurationServiceMock,
        },
        {
          provide: ERROR_COMPONENT_CONFIG,
          useValue: errorComponentConfig,
        },
        {
          provide: LuigiCoreService,
          useValue: luigiCoreService,
        },
        provideHttpClient(),
      ],
      imports: [RouterModule.forRoot([])],
    });
    service = TestBed.inject(LuigiNodesService);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearNodeCache', () => {
    it('should call the serviceProviderService.clearCache method', () => {
      const serviceProviderServiceSpy = vi.spyOn(
        configService,
        'clearEntityConfigCache',
      );
      service.clearNodeCache();
      expect(serviceProviderServiceSpy).toHaveBeenCalled();
    });
  });

  describe('retrieveEntityChildren', () => {
    const mockEntityDefinition: EntityDefinition = {
      id: 'testEntity',
      dynamicFetchId: 'testEntityType',
    };

    const mockExistingChildren: LuigiNode[] = [
      {
        pathSegment: 'existing1',
        label: 'Existing Node 1',
        context: {} as NodeContext,
      },
    ];

    const mockServiceProvider: ServiceProvider = {
      name: 'name',
      displayName: 'displayName',
      creationTimestamp: new Date().toISOString(),
      nodes: [
        {
          pathSegment: 'node1',
          label: 'Test Node 1',
          context: {} as NodeContext,
        },
        {
          pathSegment: 'node2',
          label: 'Test Node 2',
          context: {} as NodeContext,
        },
      ],
    };

    const mockEntityConfig: EntityConfig = {
      providers: [mockServiceProvider],
      entityContext: {},
    };

    it('should successfully merge existing children with new entity children', async () => {
      vi.spyOn(configService, 'getEntityConfig').mockResolvedValue(
        mockEntityConfig,
      );

      const result = await service.retrieveEntityChildren(mockEntityDefinition);

      expect(result.length).toBe(2);
      expect(result).toEqual(mockServiceProvider.nodes);

      expect(configService.getEntityConfig).toHaveBeenCalledWith(
        'testEntityType',
        undefined,
      );
    });

    it('should handle 404 error and call error component config', async () => {
      const notFoundError = new HttpErrorResponse({ status: 404 });
      vi.spyOn(configService, 'getEntityConfig').mockRejectedValue(
        notFoundError,
      );

      const result = await service.retrieveEntityChildren(mockEntityDefinition);

      expect(
        errorComponentConfig.handleEntityRetrievalError,
      ).toHaveBeenCalledWith(mockEntityDefinition, 404, undefined);
    });

    it('should handle other errors with 500 status', async () => {
      const genericError = new Error('Some error');
      vi.spyOn(configService, 'getEntityConfig').mockRejectedValue(
        genericError,
      );
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await service.retrieveEntityChildren(mockEntityDefinition);

      expect(
        errorComponentConfig.handleEntityRetrievalError,
      ).toHaveBeenCalledWith(mockEntityDefinition, 500, undefined);
    });

    it('should show alert if error component config is not provided', async () => {
      errorComponentConfig.handleEntityRetrievalError = undefined;
      const result = await service.retrieveEntityChildren(mockEntityDefinition);
      expect(luigiCoreService.showAlert).toHaveBeenCalledWith({
        text: 'Could not retrieve nodes for entity: testEntityType',
        type: 'error',
      });
    });

    it('should pass additional context to getEntityConfig', async () => {
      const additionalContext = { customKey: 'customValue' };

      vi.spyOn(configService, 'getEntityConfig').mockResolvedValue(
        mockEntityConfig,
      );
      localConfigurationServiceMock.replaceServerNodesWithLocalOnes.mockResolvedValue(
        [...mockServiceProvider.nodes],
      );

      await service.retrieveEntityChildren(
        mockEntityDefinition,
        additionalContext,
      );

      expect(configService.getEntityConfig).toHaveBeenCalledWith(
        'testEntityType',
        additionalContext,
      );
    });

    it('should handle empty existing children', async () => {
      vi.spyOn(configService, 'getEntityConfig').mockResolvedValue(
        mockEntityConfig,
      );
      localConfigurationServiceMock.replaceServerNodesWithLocalOnes.mockResolvedValue(
        [...mockServiceProvider.nodes],
      );

      const result = await service.retrieveEntityChildren(mockEntityDefinition);

      expect(result.length).toBe(2);
      expect(result).toEqual(mockServiceProvider.nodes);
    });

    it('should handle other errors when retrieving configs for entity', async () => {
      console.warn = vi.fn();
      const entityDefinition: EntityDefinition = {
        id: 'id',
        dynamicFetchId: 'someEntity',
      };
      const existingChildren: LuigiNode[] = [];
      const parentEntityPath = 'parent';
      const additionalContext = { someContext: 'value' };

      const serviceProviderServiceSpy = vi
        .spyOn(configService, 'getEntityConfig')
        .mockRejectedValue(new Error('Some other error'));

      await service.retrieveEntityChildren(entityDefinition, additionalContext);

      expect(serviceProviderServiceSpy).toHaveBeenCalledWith(
        'someEntity',
        additionalContext,
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Could not retrieve nodes for entity: someEntity, error: ',
        expect.any(Error),
      );
    });

    it('should handle other errors when retrieving configs for entity', async () => {
      console.warn = vi.fn();
      const entityDefinition: EntityDefinition = {
        id: 'id',
        dynamicFetchId: 'someEntity',
      };
      const existingChildren: LuigiNode[] = [];
      const parentEntityPath = 'parent';
      const additionalContext = { someContext: 'value' };

      const serviceProviderServiceSpy = vi
        .spyOn(configService, 'getEntityConfig')
        .mockRejectedValue(new Error('Some other error'));

      await service.retrieveEntityChildren(entityDefinition, additionalContext);

      expect(serviceProviderServiceSpy).toHaveBeenCalledWith(
        'someEntity',
        additionalContext,
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Could not retrieve nodes for entity: someEntity, error: ',
        expect.any(Error),
      );
    });
  });

  describe('retrieveChildrenByEntity', () => {
    let serviceProviderNodes;

    const createNodeWithEntityType = (
      entityType: string,
      pathSegment: string,
      categoryOrder?: number,
      serviceProviderConfig?: Record<string, string>,
    ) => {
      const mockLuigiNode = mock<LuigiNode>();
      mockLuigiNode.entityType = entityType;
      mockLuigiNode.pathSegment = pathSegment;
      mockLuigiNode.context = { serviceProviderConfig } as any;
      if (categoryOrder) {
        mockLuigiNode.category = {
          label: entityType,
          collapsible: false,
          order: categoryOrder,
        };
      }
      return mockLuigiNode;
    };

    beforeEach(() => {
      serviceProviderNodes = [
        createNodeWithEntityType('', 'a', 1),
        createNodeWithEntityType('', 'b', 2),
        createNodeWithEntityType('foo', 'c', 3),
        createNodeWithEntityType('home', 'd', 10),
        createNodeWithEntityType('foo', 'e', 11),
        createNodeWithEntityType('bar', 'f', 20),
      ];

      const portalConfig: PortalConfig = {
        providers: [
          {
            viewGroup: 'foo',
            nodes: serviceProviderNodes,
            creationTimestamp: '2022-05-17T11:37:17Z',
          },
        ],
      } as any;

      vi.spyOn(configService, 'getPortalConfig').mockResolvedValue(
        portalConfig,
      );

      vi.spyOn(configService, 'getEntityConfig').mockResolvedValue({
        providers: portalConfig.providers,
      } as any);
    });

    it('should handle errors when retrieving nodes', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const errorMessage = 'Failed to retrieve nodes';
      const serviceProviderServiceSpy = vi
        .spyOn(configService, 'getPortalConfig')
        .mockRejectedValue(new Error(errorMessage));

      try {
        await service.retrieveChildrenByEntity();
      } catch (e) {
        expect(serviceProviderServiceSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Could not retrieve nodes, error: ',
          expect.any(Error),
        );
      }
    });

    describe('categories', () => {
      it('should sort to 3 categories', async () => {
        const childrenByEntity = await service.retrieveChildrenByEntity();

        expect(Object.keys(childrenByEntity).length).toBe(3);
      });

      it('should sort multiple entries to a single category', async () => {
        const childrenByEntity = await service.retrieveChildrenByEntity();

        expect(childrenByEntity['foo'].length).toBe(2);
      });

      it('should sort a single item to a category', async () => {
        const childrenByEntity = await service.retrieveChildrenByEntity();

        expect(childrenByEntity['bar'].length).toBe(1);
      });

      it('should default to home', async () => {
        const childrenByEntity = await service.retrieveChildrenByEntity();

        expect(childrenByEntity['home'].length).toBe(3);
      });
    });
  });

  describe('nodePolicyResolver', () => {
    it('should return true if the node has no required policies', () => {
      const node: LuigiNode = {
        pathSegment: 'node1',
        label: 'Node 1',
        requiredPolicies: [],
        context: {} as NodeContext,
      };

      const result = service.nodePolicyResolver(node);
      expect(result).toBe(true);
    });

    it('should return true if the node has required policies and the user has all of them', () => {
      const node: LuigiNode = {
        pathSegment: 'node2',
        label: 'Node 2',
        requiredPolicies: ['projectMember'],
        context: {} as NodeContext,
      };

      const result = service.nodePolicyResolver(node);
      expect(result).toBe(true);
    });

    it('should return false if the node has required policies and the user does not have all of them', () => {
      const node: LuigiNode = {
        pathSegment: 'node3',
        label: 'Node 3',
        requiredPolicies: ['projectMember', 'admin', 'superAdmin'],
        context: {} as NodeContext,
      };

      const result = service.nodePolicyResolver(node);
      expect(result).toBe(false);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { mock } from 'jest-mock-extended';
import { LuigiNodesService } from './luigi-nodes.service';
import { RouterModule } from '@angular/router';
import { ServiceProviderService } from '../portal/service-provider.service';
import { ServiceProvider } from '../../models/portal';
import { EntityDefinition, LuigiNode } from '../../models/luigi';
import {
  LocalNodesService,
  NoopLocalNodesService,
} from './local-nodes.service';
import { LOCAL_NODES_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { HttpErrorResponse } from '@angular/common/http';

describe('LuigiNodesService', () => {
  let service: LuigiNodesService;
  let serviceProviderService: ServiceProviderService;
  let localNodesService: LocalNodesService;

  beforeEach(() => {
    localNodesService = new NoopLocalNodesService();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LOCAL_NODES_SERVICE_INJECTION_TOKEN,
          useValue: localNodesService,
        },
      ],
      imports: [HttpClientTestingModule, RouterModule.forRoot([])],
    });
    service = TestBed.inject(LuigiNodesService);
    serviceProviderService = TestBed.inject(ServiceProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearNodeCache', () => {
    it('should call the serviceProviderService.clearCache method', () => {
      const serviceProviderServiceSpy = jest.spyOn(
        serviceProviderService,
        'clearCache'
      );
      service.clearNodeCache();
      expect(serviceProviderServiceSpy).toHaveBeenCalled();
    });
  });

  describe('retrieveAndMergeEntityChildren', () => {
    it('should handle 404 error when retrieving configs for entity', async () => {
      const entityDefinition: EntityDefinition = {
        id: 'id',
        dynamicFetchId: 'someEntity',
      };
      const existingChildren: LuigiNode[] = [];
      const parentEntityPath = 'parent';
      const additionalContext = { someContext: 'value' };

      const serviceProviderServiceSpy = jest
        .spyOn(serviceProviderService, 'getRawConfigsForEntity')
        .mockRejectedValue(new HttpErrorResponse({ status: 404 }));

      const result = await service.retrieveAndMergeEntityChildren(
        entityDefinition,
        existingChildren,
        parentEntityPath,
        additionalContext
      );

      expect(serviceProviderServiceSpy).toHaveBeenCalledWith(
        'someEntity',
        additionalContext
      );
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            entityType: 'ERROR_NOT_FOUND',
            viewUrl: '/error-handling#entity_404',
          }),
        ])
      );
    });

    it('should handle other errors when retrieving configs for entity', async () => {
      console.warn = jest.fn();
      const entityDefinition: EntityDefinition = {
        id: 'id',
        dynamicFetchId: 'someEntity',
      };
      const existingChildren: LuigiNode[] = [];
      const parentEntityPath = 'parent';
      const additionalContext = { someContext: 'value' };

      const serviceProviderServiceSpy = jest
        .spyOn(serviceProviderService, 'getRawConfigsForEntity')
        .mockRejectedValue(new Error('Some other error'));

      await service.retrieveAndMergeEntityChildren(
        entityDefinition,
        existingChildren,
        parentEntityPath,
        additionalContext
      );

      expect(serviceProviderServiceSpy).toHaveBeenCalledWith(
        'someEntity',
        additionalContext
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Could not retrieve nodes for entity someEntity, error: ',
        expect.any(Error)
      );
    });
  });

  describe('retrieveChildrenByEntity', () => {
    let localNodeServiceSpy;
    let serviceProviderNodes;

    const createNodeWithEntityType = (
      entityType: string,
      pathSegment: string,
      categoryOrder?: number,
      serviceProviderConfig?: Record<string, string>
    ) => {
      const mockLuigiNode = mock<LuigiNode>();
      mockLuigiNode.entityType = entityType;
      mockLuigiNode.pathSegment = pathSegment;
      mockLuigiNode.context = { serviceProviderConfig };
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
      const configServiceResponse: Promise<ServiceProvider[]> = Promise.resolve(
        [
          {
            config: { a: 'b', b: 'b' },
            installationData: { a: 'c', c: 'd' },
            viewGroup: 'foo',
            nodes: serviceProviderNodes,
            creationTimestamp: '2022-05-17T11:37:17Z',
          },
        ]
      );
      const spyInstanceForTenant = jest.spyOn(
        serviceProviderService,
        'getRawConfigsForTenant'
      );
      spyInstanceForTenant.mockReturnValue(configServiceResponse);

      const spyInstanceForProject = jest.spyOn(
        serviceProviderService,
        'getRawConfigsForEntity'
      );
      spyInstanceForProject.mockReturnValue(configServiceResponse);

      localNodeServiceSpy = jest.spyOn(localNodesService, 'getLocalNodes');
      localNodeServiceSpy.mockReturnValue(Promise.resolve([]));
    });

    it('should handle errors when retrieving tenant nodes', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      const errorMessage = 'Failed to retrieve tenant nodes';
      const serviceProviderServiceSpy = jest
        .spyOn(serviceProviderService, 'getRawConfigsForTenant')
        .mockRejectedValue(new Error(errorMessage));

      try {
        await service.retrieveChildrenByEntity();
      } catch (e) {
        expect(serviceProviderServiceSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Could not retrieve tenant nodes, error: ',
          expect.any(Error)
        );
      }
    });

    describe('config', () => {
      it('should extend the node with a config', async () => {
        const childrenByEntity = await service.retrieveChildrenByEntity();

        const home = childrenByEntity['home'];
        expect(home[0].context.serviceProviderConfig).toStrictEqual({
          a: 'c',
          b: 'b',
          c: 'd',
        });
        expect(home[1].context.serviceProviderConfig).toStrictEqual(
          home[0].context.serviceProviderConfig
        );
      });
    });

    describe('new badge', () => {
      it('should add new badge to new nodes', async () => {
        service['shouldShowNewBadge'] = jest.fn().mockReturnValue(true);

        const childrenByEntity = await service.retrieveChildrenByEntity();

        Object.keys(childrenByEntity).forEach((entity) => {
          childrenByEntity[entity].forEach((node) => {
            expect(node.statusBadge).toEqual({
              label: 'New',
              type: 'informative',
            });
          });
        });
      });

      it('should not add a new badge to nodes', async () => {
        const serviceProviders: ServiceProvider[] = [
          {
            config: { a: 'b', b: 'b' },
            installationData: { a: 'c', c: 'd' },
            nodes: [
              { label: 'Node 1', pathSegment: '/node1' },
              { label: 'Node 2', pathSegment: '/node2' },
            ],
            creationTimestamp: '2022-05-17T11:37:17Z',
            isMandatoryExtension: true,
          },
        ];

        const serviceProviderServiceSpy = jest
          .spyOn(serviceProviderService, 'getRawConfigsForTenant')
          .mockResolvedValue(serviceProviders);

        const childrenByEntity = await service.retrieveChildrenByEntity();

        expect(serviceProviderServiceSpy).toHaveBeenCalled();
        Object.values(childrenByEntity).forEach((nodes) => {
          nodes.forEach((node) => {
            expect(node.statusBadge).toBeUndefined();
          });
        });
      });
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
      };

      const result = service.nodePolicyResolver(node);
      expect(result).toBe(true);
    });

    it('should return true if the node has required policies and the user has all of them', () => {
      const node: LuigiNode = {
        pathSegment: 'node2',
        label: 'Node 2',
        requiredPolicies: ['projectMember'],
      };

      const result = service.nodePolicyResolver(node);
      expect(result).toBe(true);
    });

    it('should return false if the node has required policies and the user does not have all of them', () => {
      const node: LuigiNode = {
        pathSegment: 'node3',
        label: 'Node 3',
        requiredPolicies: ['projectMember', 'admin', 'superAdmin'],
      };

      const result = service.nodePolicyResolver(node);
      expect(result).toBe(false);
    });
  });
});

import { LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode } from '../../models';
import { ConfigService } from '../portal';
import { ChildrenNodesService } from './children-nodes.service';
import { CustomNodeProcessingService } from './custom-node-processing.service';
import { NavHeaderService } from './nav-header.service';
import { NodeSortingService } from './node-sorting.service';
import { NodeUtilsService } from './node-utils.service';
import { VPNService } from './vpn.service';
import { TestBed } from '@angular/core/testing';
import { Context } from '@luigi-project/client';
import { MockedObject } from 'vitest';

describe('ChildrenNodesService', () => {
  let service: ChildrenNodesService;
  let configService: MockedObject<ConfigService>;
  let nodeUtilsService: MockedObject<NodeUtilsService>;
  let nodeSortingService: MockedObject<NodeSortingService>;
  let customNodeProcessingService: MockedObject<CustomNodeProcessingService>;
  let navHeaderService: MockedObject<NavHeaderService>;
  let vpnService: MockedObject<VPNService>;

  beforeEach(() => {
    configService = {
      getEntityConfig: vi.fn(),
    } as any;

    nodeUtilsService = {
      retrieveGlobalHelpContext: vi.fn(),
    } as any;

    nodeSortingService = {
      sortNodes: vi.fn(),
    } as any;

    customNodeProcessingService = {
      processNode: vi.fn(),
    } as any;

    navHeaderService = {
      setupNavigationHeader: vi.fn(),
    } as any;

    vpnService = {
      whenReady: vi.fn().mockResolvedValue(undefined),
      applyNetworkVisibility: vi.fn((node) => node),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ChildrenNodesService,
        { provide: ConfigService, useValue: configService },
        { provide: NodeUtilsService, useValue: nodeUtilsService },
        { provide: NodeSortingService, useValue: nodeSortingService },
        { provide: NavHeaderService, useValue: navHeaderService },
        { provide: VPNService, useValue: vpnService },
        {
          provide: LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN,
          useValue: customNodeProcessingService,
        },
      ],
    });

    service = TestBed.inject(ChildrenNodesService);
  });

  describe('processChildrenForEntity', () => {
    it('should return empty array when children is null', async () => {
      const result = await service.processChildrenForEntity(
        {} as LuigiNode,
        null as any,
        {},
      );
      expect(result).toEqual([]);
    });

    it('should delegate navHeader processing to NavHeaderService', async () => {
      const entityNode = {
        defineEntity: { id: 'test' },
      } as LuigiNode;

      await service.processChildrenForEntity(entityNode, [], {});

      expect(navHeaderService.setupNavigationHeader).toHaveBeenCalledWith(
        entityNode,
      );
    });

    it('should process entity context and apply it to children', async () => {
      const entityNode = {
        defineEntity: {
          id: 'test',
          contextKey: 'testId',
          dynamicFetchId: 'test',
        },
      } as LuigiNode;

      const children = [{ context: {} }] as LuigiNode[];
      const ctx = {};

      configService.getEntityConfig.mockResolvedValue({
        entityContext: { myKey: 'value' },
        providers: null as any,
      });
      customNodeProcessingService.processNode.mockImplementation(
        async (ctx: Context, node: LuigiNode) => node,
      );
      nodeSortingService.sortNodes.mockImplementation((nodes) => nodes);

      const childResult = await service.processChildrenForEntity(
        entityNode,
        children,
        ctx,
      );

      expect(childResult[0]?.context?.entityContext).toBeDefined();
      expect(childResult[0].context).toEqual({
        entityContext: { test: { myKey: 'value' } },
      });
      expect(nodeUtilsService.retrieveGlobalHelpContext).toHaveBeenCalled();
    });

    it('should handle errors in entity config fetching', async () => {
      const entityNode = {
        defineEntity: { id: 'test' },
      } as LuigiNode;

      const children = [{ context: {} }] as LuigiNode[];
      const ctx = {};

      configService.getEntityConfig.mockRejectedValue(
        new Error('Config error'),
      );
      customNodeProcessingService.processNode.mockImplementation(
        async (ctx, node: LuigiNode) => node,
      );
      nodeSortingService.sortNodes.mockImplementation((nodes) => nodes);

      const result = await service.processChildrenForEntity(
        entityNode,
        children,
        ctx,
      );

      expect(result).toBeDefined();
    });

    it('should await VPN readiness and apply network visibility to entity children', async () => {
      const entityNode = {
        defineEntity: { id: 'test' },
      } as LuigiNode;

      const child = { context: {} } as LuigiNode;
      const convertedChild = { context: {}, viewUrl: '#no-vpn' } as LuigiNode;

      vpnService.applyNetworkVisibility.mockReturnValue(convertedChild);
      customNodeProcessingService.processNode.mockImplementation(
        async (ctx: Context, node: LuigiNode) => node,
      );
      nodeSortingService.sortNodes.mockImplementation((nodes) => nodes);

      const result = await service.processChildrenForEntity(
        entityNode,
        [child],
        {},
      );

      expect(vpnService.whenReady).toHaveBeenCalled();
      expect(vpnService.applyNetworkVisibility).toHaveBeenCalledWith(child);
      expect(result).toEqual([convertedChild]);
    });
  });
});

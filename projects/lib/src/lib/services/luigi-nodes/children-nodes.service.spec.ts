import { LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode, NodeContext } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { ConfigService } from '../portal';
import { ChildrenNodesService } from './children-nodes.service';
import { CustomNodeProcessingService } from './custom-node-processing.service';
import { NodeSortingService } from './node-sorting.service';
import { NodeUtilsService } from './node-utils.service';
import { TestBed } from '@angular/core/testing';
import { Context } from '@luigi-project/client';
import { MockedObject } from 'vitest';

describe('ChildrenNodesService', () => {
  let service: ChildrenNodesService;
  let luigiCoreService: MockedObject<LuigiCoreService>;
  let configService: MockedObject<ConfigService>;
  let nodeUtilsService: MockedObject<NodeUtilsService>;
  let nodeSortingService: MockedObject<NodeSortingService>;
  let customNodeProcessingService: MockedObject<CustomNodeProcessingService>;

  beforeEach(() => {
    luigiCoreService = {
      isFeatureToggleActive: vi.fn(),
      config: { settings: { btpToolLayout: true } },
    } as any;

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

    TestBed.configureTestingModule({
      providers: [
        ChildrenNodesService,
        { provide: LuigiCoreService, useValue: luigiCoreService },
        { provide: ConfigService, useValue: configService },
        { provide: NodeUtilsService, useValue: nodeUtilsService },
        { provide: NodeSortingService, useValue: nodeSortingService },
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

    it('should set showUpLink when useBack is true and feature toggle is active', async () => {
      const entityNode = {
        defineEntity: { useBack: true },
        navHeader: {},
      } as LuigiNode;

      luigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      await service.processChildrenForEntity(entityNode, [], {});

      expect(entityNode.navHeader.showUpLink).toBe(true);
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
  });

  describe('getSideNavigationHeaderType', () => {
    it('should return capitalized type from entityContext', () => {
      const nodeContext = {
        entityContext: {
          testId: { type: 'testType' },
        },
      };

      const nodeItem = {
        defineEntity: { dynamicFetchId: 'testId' },
      } as LuigiNode;

      const result = (service as any).getSideNavigationHeaderType(
        nodeContext,
        nodeItem,
      );

      expect(result).toBe('TestType');
    });

    it('should fallback to label when type is not available', () => {
      const nodeContext = {};
      const nodeItem = {
        defineEntity: { label: 'testLabel' },
      } as LuigiNode;

      const result = (service as any).getSideNavigationHeaderType(
        nodeContext,
        nodeItem,
      );

      expect(result).toBe('TestLabel');
    });

    it('should fallback to dynamicFetchId when label is not available', () => {
      const nodeContext = {};
      const nodeItem = {
        defineEntity: { dynamicFetchId: 'testId' },
      } as LuigiNode;

      const result = (service as any).getSideNavigationHeaderType(
        nodeContext,
        nodeItem,
      );

      expect(result).toBe('Test');
    });

    it('should fallback to Extension when no other options are available', () => {
      const nodeContext = {};
      const nodeItem = {
        defineEntity: {},
      } as LuigiNode;

      const result = (service as any).getSideNavigationHeaderType(
        nodeContext,
        nodeItem,
      );

      expect(result).toBe('Extension');
    });
  });

  describe('addNavigationHeader', () => {
    it('should render correct HTML structure', () => {
      const entityNode = {
        defineEntity: {},
        navHeader: {
          label: 'Test Label',
          context: {},
        },
      } as LuigiNode;

      service.addNavigationHeader(entityNode);

      const container = document.createElement('div');
      entityNode.navHeader.renderer(
        container,
        entityNode,
        () => {},
        entityNode.navHeader,
      );

      expect(container.innerHTML).toContain('entity-nav-header');
      expect(container.innerHTML).toContain('Test Label');
    });

    it('should not add navHeader when entityNode has no defineEntity', () => {
      // Arrange
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        context: {} as NodeContext,
      };

      // Act
      service.addNavigationHeader(entityNode);

      // Assert
      expect(entityNode.navHeader).toBeUndefined();
    });

    it('should initialize navHeader if not present', () => {
      // Arrange
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
        context: {} as NodeContext,
      };

      // Act
      service.addNavigationHeader(entityNode);

      // Assert
      expect(entityNode.navHeader).toBeDefined();
      expect(entityNode.navHeader.renderer).toBeDefined();
    });

    it('should preserve existing navHeader properties while adding renderer', () => {
      // Arrange
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
        navHeader: {
          existingProp: 'test',
        },
        context: {} as NodeContext,
      };

      // Act
      service.addNavigationHeader(entityNode);

      // Assert
      expect(entityNode.navHeader.existingProp).toBe('test');
      expect(entityNode.navHeader.renderer).toBeDefined();
    });

    describe('navHeader renderer', () => {
      let entityNode: LuigiNode;
      let containerElement: HTMLElement;

      beforeEach(() => {
        entityNode = {
          pathSegment: 'test',
          defineEntity: {
            id: 'testEntity',
            label: 'Test Entity',
          },
          context: {} as NodeContext,
        };
        containerElement = document.createElement('div');
      });

      it('should not modify container if navHeader label is missing', () => {
        // Arrange
        service.addNavigationHeader(entityNode);
        const originalHTML = containerElement.innerHTML;

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          {},
        );

        // Assert
        expect(containerElement.innerHTML).toBe(originalHTML);
      });

      it('should render header with correct structure and content', () => {
        // Arrange
        service.addNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label' };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        // Assert
        expect(containerElement.classList.contains('entity-nav-header')).toBe(
          true,
        );
        expect(
          containerElement.querySelector('.entity-nav-header-type'),
        ).toBeDefined();
        expect(
          containerElement.querySelector('.entity-nav-header-label'),
        ).toBeDefined();
        expect(containerElement.innerHTML).toContain('Test Entity');
        expect(containerElement.innerHTML).toContain('Test Label');
      });

      it('should not render unsafe HTML', () => {
        // Arrange
        service.addNavigationHeader(entityNode);
        const navHeader = { label: 'Unsafe <script>alert("Test")</script>' };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        // Assert
        expect(containerElement.innerHTML).not.toContain('<script>');
      });

      it('should use "Component" if entity label is set to "component"', () => {
        // Arrange
        (entityNode.defineEntity as any).label = 'component';
        service.addNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label' };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        // Assert
        expect(containerElement.innerHTML).toContain('Component');
      });

      it('should use "Product" for product-type projects', () => {
        // Arrange
        entityNode.defineEntity = {
          id: 'project',
          label: 'Project',
          dynamicFetchId: 'project',
        };
        service.addNavigationHeader(entityNode);
        const navHeader = {
          label: 'Test Label',
          context: { entityContext: { project: { type: 'product' } } },
        };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        // Assert
        expect(containerElement.innerHTML).toContain('Product');
      });

      it('should use "Experiment" for experiment-type projects', () => {
        // Arrange
        entityNode.defineEntity = {
          id: 'project',
          label: 'Project',
          dynamicFetchId: 'project',
        };

        service.addNavigationHeader(entityNode);
        const navHeader = {
          label: 'Test Label',
          context: { entityContext: { project: { type: 'experiment' } } },
        };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        // Assert
        expect(containerElement.innerHTML).toContain('Experiment');
      });
    });
  });
});

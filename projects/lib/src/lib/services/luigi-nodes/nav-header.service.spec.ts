import { LuigiNode, NodeContext } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { NavHeaderService } from './nav-header.service';
import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';

describe('NavHeaderService', () => {
  let service: NavHeaderService;
  let luigiCoreService: MockedObject<LuigiCoreService>;

  beforeEach(() => {
    luigiCoreService = {
      isFeatureToggleActive: vi.fn(),
      config: { settings: { btpToolLayout: true } },
    } as any;

    TestBed.configureTestingModule({
      providers: [
        NavHeaderService,
        { provide: LuigiCoreService, useValue: luigiCoreService },
      ],
    });

    service = TestBed.inject(NavHeaderService);
  });

  describe('addNavigationHeader', () => {
    it('should set showUpLink when useBack is true and feature toggle is active', () => {
      const entityNode = {
        defineEntity: { useBack: true },
        navHeader: {},
      } as LuigiNode;

      luigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      service.setupNavigationHeader(entityNode);

      expect(entityNode.navHeader!.showUpLink).toBe(true);
    });

    it('should not set showUpLink when navHeader is missing', () => {
      const entityNode = {
        defineEntity: { useBack: true },
      } as LuigiNode;

      luigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      service.setupNavigationHeader(entityNode);

      expect(entityNode.navHeader).toBeUndefined();
    });

    it('should render correct HTML structure', () => {
      const entityNode = {
        defineEntity: {},
        navHeader: {
          label: 'Test Label',
          context: {},
        },
      } as LuigiNode;

      service.setupNavigationHeader(entityNode);

      const container = document.createElement('div');
      entityNode.navHeader!.renderer!(
        container,
        entityNode,
        () => {},
        entityNode.navHeader!,
      );

      expect(container.innerHTML).toContain('entity-nav-header');
      expect(container.innerHTML).toContain('Test Label');
    });

    it('should not add navHeader when entityNode has no defineEntity', () => {
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        context: {} as NodeContext,
      };

      service.setupNavigationHeader(entityNode);

      expect(entityNode.navHeader).toBeUndefined();
    });

    it('should not initialize navHeader if not present', () => {
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
        context: {} as NodeContext,
      };

      service.setupNavigationHeader(entityNode);

      expect(entityNode.navHeader).toBeUndefined();
    });

    it('should preserve existing navHeader properties while adding renderer', () => {
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
        navHeader: {
          label: 'test',
          type: 'test',
        },
        context: {} as NodeContext,
      };

      service.setupNavigationHeader(entityNode);

      expect(entityNode.navHeader!.type).toBe('test');
      expect(entityNode.navHeader!.renderer).toBeDefined();
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
          navHeader: {} as any,
          context: {} as NodeContext,
        };
        containerElement = document.createElement('div');
      });

      it('should not modify container if navHeader label is missing', () => {
        service.setupNavigationHeader(entityNode);
        const originalHTML = containerElement.innerHTML;

        entityNode.navHeader!.renderer!(
          containerElement,
          entityNode,
          () => {},
          {},
        );

        expect(containerElement.innerHTML).toBe(originalHTML);
      });

      it('should render header with correct structure and content', () => {
        service.setupNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label' };

        entityNode.navHeader!.renderer!(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

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
        service.setupNavigationHeader(entityNode);
        const navHeader = { label: 'Unsafe <script>alert("Test")</script>' };

        entityNode.navHeader!.renderer!(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        expect(containerElement.innerHTML).not.toContain('<script>');
      });

      it('should use "Component" if entity label is set to "component"', () => {
        (entityNode.defineEntity as any).label = 'component';
        service.setupNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label' };

        entityNode.navHeader!.renderer!(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        expect(containerElement.innerHTML).toContain('Component');
      });

      it('should use "Product" for product-type projects', () => {
        entityNode.defineEntity = {
          id: 'project',
          label: 'Project',
          dynamicFetchId: 'project',
        };
        service.setupNavigationHeader(entityNode);
        const navHeader = {
          label: 'Test Label',
          context: { entityContext: { project: { type: 'product' } } },
        };

        entityNode.navHeader!.renderer!(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        expect(containerElement.innerHTML).toContain('Product');
      });

      it('should use "Experiment" for experiment-type projects', () => {
        entityNode.defineEntity = {
          id: 'project',
          label: 'Project',
          dynamicFetchId: 'project',
        };

        service.setupNavigationHeader(entityNode);
        const navHeader = {
          label: 'Test Label',
          context: { entityContext: { project: { type: 'experiment' } } },
        };

        entityNode.navHeader!.renderer!(
          containerElement,
          entityNode,
          () => {},
          navHeader,
        );

        expect(containerElement.innerHTML).toContain('Experiment');
      });

      it('should fallback to dynamicFetchId when label is not available', () => {
        entityNode.defineEntity = {
          id: 'testEntity',
          dynamicFetchId: 'testId',
        };
        service.setupNavigationHeader(entityNode);

        entityNode.navHeader!.renderer!(containerElement, entityNode, () => {}, {
          label: 'Test Label',
        });

        expect(containerElement.innerHTML).toContain('Test');
      });

      it('should fallback to Extension when label and dynamicFetchId are missing', () => {
        entityNode.defineEntity = {
          id: 'testEntity',
        };
        service.setupNavigationHeader(entityNode);

        entityNode.navHeader!.renderer!(containerElement, entityNode, () => {}, {
          label: 'Test Label',
        });

        expect(containerElement.innerHTML).toContain('Extension');
      });
    });
  });
});

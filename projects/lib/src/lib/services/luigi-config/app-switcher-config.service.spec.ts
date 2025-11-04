import { LuigiNode, NodeContext } from '../../models';
import { EntityType } from '../../models/entity';
import { LuigiCoreService } from '../luigi-core.service';
import { NodeUtilsService } from '../luigi-nodes/node-utils.service';
import { AppSwitcherConfigServiceImpl } from './app-switcher-config.service';
import { TestBed } from '@angular/core/testing';

describe('AppSwitcherConfigServiceImpl', () => {
  let service: AppSwitcherConfigServiceImpl;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let nodeUtilsServiceMock: jest.Mocked<NodeUtilsService>;

  const mockNavigationObject = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    // Create mock services
    luigiCoreServiceMock = {
      navigation: jest.fn().mockReturnValue(mockNavigationObject),
    } as unknown as jest.Mocked<LuigiCoreService>;

    nodeUtilsServiceMock = {
      isVisible: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<NodeUtilsService>;

    // Configure TestBed
    TestBed.configureTestingModule({
      providers: [
        AppSwitcherConfigServiceImpl,
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        { provide: NodeUtilsService, useValue: nodeUtilsServiceMock },
      ],
    });

    // Get the service instance
    service = TestBed.inject(AppSwitcherConfigServiceImpl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppSwitcher', () => {
    let mockLuigiNodes: LuigiNode[];

    beforeEach(() => {
      // Setup mock nodes
      mockLuigiNodes = [
        {
          label: 'Node 1',
          icon: 'home',
          pathSegment: 'home',
          entityType: EntityType.GLOBAL,
          hideFromNav: false,
        },
        {
          label: 'Node 2',
          icon: 'settings',
          pathSegment: 'settings',
          entityType: EntityType.GLOBAL,
          hideFromNav: false,
        },
        {
          label: 'Hidden Node',
          icon: 'cart',
          pathSegment: 'cart',
          entityType: EntityType.GLOBAL,
          hideFromNav: true,
        },
        {
          label: 'Non-Global Node',
          icon: 'user',
          pathSegment: 'user',
          entityType: EntityType.GLOBAL_TOPNAV,
          hideFromNav: false,
        },
      ] as LuigiNode[];
    });

    it('should return the correct app switcher configuration', () => {
      const result = service.getAppSwitcher(mockLuigiNodes);

      expect(result.keepMainTitle).toBe(true);
      expect(result.showSubTitle).toBe(false);
      expect(typeof result.itemRenderer).toBe('function');
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('should filter nodes correctly', () => {
      const result = service.getAppSwitcher(mockLuigiNodes);

      // Should only include visible, non-hidden, GLOBAL nodes
      expect(result.items.length).toBe(2);
      expect(result.items[0].title).toBe('Node 1');
      expect(result.items[1].title).toBe('Node 2');
    });

    it('should map nodes to the correct format', () => {
      const result = service.getAppSwitcher(mockLuigiNodes);

      expect(result.items[0]).toEqual({
        title: 'Node 1',
        icon: 'home',
        link: '/home',
      });

      expect(result.items[1]).toEqual({
        title: 'Node 2',
        icon: 'settings',
        link: '/settings',
      });
    });

    it('should handle empty node array', () => {
      const result = service.getAppSwitcher([]);

      expect(result.items).toEqual([]);
    });

    it('should handle null node array', () => {
      const result = service.getAppSwitcher(null as unknown as LuigiNode[]);

      expect(result.items).toEqual([]);
    });

    it('should handle one element node array, the menu is not displayed when there is only one element in the array', () => {
      const mockLuigiOneGlobalNode = [
        {
          label: 'Node 1',
          icon: 'home',
          pathSegment: 'home',
          entityType: EntityType.GLOBAL,
          hideFromNav: false,
          context: {} as NodeContext,
        },
      ];
      const result = service.getAppSwitcher(mockLuigiOneGlobalNode);

      expect(result.items).toEqual([]);
    });

    it('should check node visibility using NodeUtilsService', () => {
      nodeUtilsServiceMock.isVisible
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const result = service.getAppSwitcher(mockLuigiNodes);

      expect(nodeUtilsServiceMock.isVisible).toHaveBeenCalledTimes(2);
      expect(result.items.length).toBe(0);
    });
  });

  describe('itemRenderer', () => {
    let mockItem: any;
    let mockSlot: HTMLElement;
    let mockAppSwitcherApiObj: any;
    let itemRenderer: Function;

    beforeEach(() => {
      mockItem = {
        title: 'Test Item',
        icon: 'home',
        link: '/test',
      };

      mockSlot = document.createElement('div');

      mockAppSwitcherApiObj = {
        closeDropDown: jest.fn(),
      };

      itemRenderer = service.getAppSwitcher([]).itemRenderer;
    });

    it('should create the correct DOM structure', () => {
      itemRenderer(mockItem, mockSlot, mockAppSwitcherApiObj);

      // Check if the anchor element was created
      const anchor = mockSlot.querySelector('a.fd-menu__link');
      expect(anchor).toBeTruthy();

      // Check the icon
      const icon = mockSlot.querySelector('i.sap-icon--home');
      expect(icon).toBeTruthy();

      // Check the text
      const title: any = mockSlot.querySelector('.fd-menu__title');
      expect(title.innerText).toBe('Test Item');
    });

    it('should attach click event that navigates and closes dropdown', () => {
      itemRenderer(mockItem, mockSlot, mockAppSwitcherApiObj);

      const anchor = mockSlot.querySelector('a');
      const mockEvent = {
        stopPropagation: jest.fn(),
      };

      // Simulate click
      anchor?.dispatchEvent(new MouseEvent('click'));

      // Check if navigation was called
      expect(luigiCoreServiceMock.navigation).toHaveBeenCalled();
      expect(mockNavigationObject.navigate).toHaveBeenCalledWith('/test');

      // Check if dropdown was closed
      expect(mockAppSwitcherApiObj.closeDropDown).toHaveBeenCalled();
    });
  });
});

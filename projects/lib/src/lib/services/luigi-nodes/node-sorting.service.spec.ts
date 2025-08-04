import { LuigiNode } from '../../models/luigi';
import { LuigiCoreService } from '../luigi-core.service';
import { NodeSortingService } from './node-sorting.service';
import { TestBed } from '@angular/core/testing';

describe('NodeSortingService', () => {
  let service: NodeSortingService;
  let luigiCoreService: LuigiCoreService;

  let entityDefinitionNode1;
  let entityDefinitionNode2;
  let entityExtensionNodesWithCategories;
  let entityExtensionNodes1;
  let entityExtensionNodes2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NodeSortingService, LuigiCoreService],
      imports: [],
    }).compileComponents();
  });
  beforeEach(() => {
    service = TestBed.inject(NodeSortingService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    jest.spyOn(luigiCoreService, 'getConfigValue').mockImplementation();
  });
  beforeEach(() => {
    entityDefinitionNode1 = {
      defineEntity: {
        id: 'test',
      },
      children: [
        {
          label: 'firstnode',
        },
        {
          defineSlot: 'firstSlot',
        },
        {
          label: 'secondnode',
        },
        {
          label: 'thirdnode',
        },
        {
          defineSlot: 'secondSlot',
        },
        {
          label: 'fourthnode',
        },
        {
          defineSlot: '', // default slot
        },
        {
          label: 'somenodeafterdefaultslot',
        },
      ],
    };

    entityDefinitionNode2 = {
      defineEntity: {
        id: 'test',
      },
      children: [
        {
          label: 'firstnode',
        },
        {
          defineSlot: 'firstSlot',
        },
      ],
    };

    entityExtensionNodes1 = [
      {
        label: 'ex1_firstnode',
        navSlot: 'secondSlot',
        order: 2,
      },
      {
        label: 'ex1_secondnode',
      },
      {
        label: 'ex1_thirdnode',
        navSlot: 'secondSlot',
      },
      {
        label: 'ex1_fourthnode',
        navSlot: 'firstSlot',
      },
    ];

    entityExtensionNodes2 = [
      {
        label: 'ex2_firstnode',
        navSlot: 'secondSlot',
        order: 3,
      },
      {
        label: 'ex2_secondnode',
      },
      {
        label: 'ex2_thirdnode',
        navSlot: 'noneExisting',
      },
      {
        label: 'ex2_fourthnode',
        navSlot: 'firstSlot',
      },
    ];

    entityExtensionNodesWithCategories = [
      {
        label: 'ex2_firstnode',
        navSlot: 'secondSlot',
        order: 3,
      },
      {
        label: 'ex2_secondnode',
      },
      {
        label: 'ex2_thirdnode',
        navSlot: 'noneExisting',
      },
      {
        label: 'ex2_fourthnode',
        navSlot: 'firstSlot',
      },
      {
        label: 'ex2_fifthnode',
        navSlot: 'firstSlot',
        category: 'myCat',
      },
    ];
  });

  describe('Node sorting', () => {
    it('should mark all nodes as entity root children', async () => {
      service.markEntityRootChildren(entityDefinitionNode1.children);
      entityDefinitionNode1.children.filter((node: LuigiNode) => {
        return node._entityRootChild;
      });
      expect(entityDefinitionNode1.children.length).toBe(8);
    });

    it('should sort a list of given nodes correctly', async () => {
      const nodeList = [
        {
          label: '1',
          order: '2',
          category: 'c2',
        },
        {
          label: '2',
          order: '1',
          category: {
            label: 'c1',
          },
        },
        {
          label: '3',
        },
        {
          label: 'last-one',
          order: '1000',
        },
        {
          label: '4',
          order: '2',
          category: {
            label: 'c2',
          },
        },
        {
          label: '5',
          order: '3',
        },
        {
          label: '6',
          order: '0',
        },
      ];
      nodeList.sort(service.nodeComparison);
      expect(nodeList).toEqual([
        {
          label: '6',
          order: '0',
        },
        {
          label: '2',
          order: '1',
          category: {
            label: 'c1',
          },
        },
        {
          label: '1',
          order: '2',
          category: 'c2',
        },
        {
          label: '4',
          order: '2',
          category: {
            label: 'c2',
          },
        },
        {
          label: '5',
          order: '3',
        },
        {
          label: '3',
          order: '999',
        },
        {
          label: 'last-one',
          order: '1000',
        },
      ]);
    });

    it('should append provided nodes after a given slot node', async () => {
      const slotNode = entityDefinitionNode1.children[1];
      slotNode.category = { label: 'cat2' };

      service.appendChildrenToSlot(entityDefinitionNode1.children, slotNode, [
        { label: 'n1' },
        { label: 'n2' },
      ]);
      expect(entityDefinitionNode1.children.length).toBe(10);
      expect(entityDefinitionNode1.children[0].label).toEqual('firstnode');
      expect(entityDefinitionNode1.children[1]).toBe(slotNode);
      expect(entityDefinitionNode1.children[2].label).toEqual('n1');
      expect(entityDefinitionNode1.children[2].category).toEqual('cat2');
      expect(entityDefinitionNode1.children[3].label).toEqual('n2');
      expect(entityDefinitionNode1.children[3].category).toEqual('cat2');
      expect(entityDefinitionNode1.children[4].label).toEqual('secondnode');
    });

    it('should sort nodes correctly', async () => {
      service.markEntityRootChildren(entityDefinitionNode1.children);
      const nodeList = [
        ...entityDefinitionNode1.children,
        ...entityExtensionNodes1,
        ...entityExtensionNodes2,
      ];
      const sorted = service.sortNodes(nodeList);
      expect(sorted.length).toBe(16);
      expect(sorted.map((item) => item.label)).toEqual([
        'firstnode',
        undefined,
        'ex1_fourthnode',
        'ex2_fourthnode',
        'secondnode',
        'thirdnode',
        undefined,
        'ex1_firstnode',
        'ex2_firstnode',
        'ex1_thirdnode',
        'fourthnode',
        undefined,
        'ex1_secondnode',
        'ex2_secondnode',
        'ex2_thirdnode',
        'somenodeafterdefaultslot',
      ]);
    });

    it('should sort in nodes at the end, if no default slot is defined, starting with nodes without slot definition, grouped by (non-existing) slots', async () => {
      service.markEntityRootChildren(entityDefinitionNode2.children);
      const nodeList = [
        ...entityDefinitionNode2.children,
        ...entityExtensionNodes1,
        ...entityExtensionNodes2,
      ];
      const sorted = service.sortNodes(nodeList);
      expect(sorted.length).toBe(10);
      expect(sorted.map((item) => item.label)).toEqual([
        'firstnode',
        undefined,
        'ex1_fourthnode',
        'ex2_fourthnode',
        'ex1_secondnode',
        'ex2_secondnode',
        'ex1_firstnode',
        'ex2_firstnode',
        'ex1_thirdnode',
        'ex2_thirdnode',
      ]);
    });
  });

  it('should move nodes with category to the end', async () => {
    service.markEntityRootChildren(entityDefinitionNode1.children);
    const nodeList = [
      ...entityDefinitionNode1.children,
      ...entityExtensionNodes1,
      ...entityExtensionNodesWithCategories,
    ];
    const sorted = service.sortNodes(nodeList);
    expect(sorted.length).toBe(17);
    expect(sorted.map((item) => item.label)).toEqual([
      'firstnode',
      undefined,
      'ex1_fourthnode',
      'ex2_fourthnode',
      'secondnode',
      'thirdnode',
      undefined,
      'ex1_firstnode',
      'ex2_firstnode',
      'ex1_thirdnode',
      'fourthnode',
      undefined,
      'ex1_secondnode',
      'ex2_secondnode',
      'ex2_thirdnode',
      'somenodeafterdefaultslot',
      'ex2_fifthnode',
    ]);
  });

  it('should sort nodes alphabetically by label if orders are equal', () => {
    const nodeA = { label: 'alpha', order: '1' } as LuigiNode;
    const nodeB = { label: 'beta', order: '1' } as LuigiNode;
    const nodeC = { label: 'gamma', order: '1' } as LuigiNode;
    const nodeD = { order: '1', category: 'd' } as LuigiNode;
    const nodeE = { order: '1', category: 'd' } as LuigiNode;

    const nodes = [nodeD, nodeE, nodeC, nodeA, nodeB];
    nodes.sort(service.nodeComparison);

    expect(nodes).toEqual([nodeA, nodeB, nodeC, nodeD, nodeE]);
  });

  it('should sort nodes correctly using sortNodes method', () => {
    const nodes = [
      { label: 'gamma', order: '2' } as LuigiNode,
      { label: 'alpha', order: '1' } as LuigiNode,
      { label: 'beta', order: '2' } as LuigiNode,
      { label: 'delta', order: '3' } as LuigiNode,
      { label: 'epsilon' } as LuigiNode, // default order '999'
    ];

    const sortedNodes = service.sortNodes(nodes);

    expect(sortedNodes).toEqual([
      { label: 'alpha', order: '1' },
      { label: 'beta', order: '2' },
      { label: 'gamma', order: '2' },
      { label: 'delta', order: '3' },
      { label: 'epsilon', order: '999' },
    ]);
  });
});

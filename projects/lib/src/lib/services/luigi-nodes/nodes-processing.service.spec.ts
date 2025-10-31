import {
  LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { EntityDefinition, LuigiNode, PortalConfig } from '../../models';
import { providePortal } from '../../portal-providers';
import { LuigiCoreService } from '../luigi-core.service';
import { ConfigService } from '../portal';
import { LocalConfigurationServiceImpl } from './local-configuration.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeContextProcessingService } from './node-context-processing.service';
import { NodesProcessingService } from './nodes-processing.service';
import { TestBed } from '@angular/core/testing';

describe('NodesProcessingService', () => {
  let service: NodesProcessingService;
  let luigiNodesService: LuigiNodesService;
  let localConfigurationService: LocalConfigurationServiceImpl;
  let luigiCoreService: LuigiCoreService;
  let configService: ConfigService;
  let nodeContextProcessingService: NodeContextProcessingService;
  let customGlobalNodesService = { getCustomGlobalNodes: jest.fn() } as any;
  const entityName = 'myentity';

  const homeChildren: LuigiNode[] = [
    {
      label: 'home1',
      pathSegment: '',
      viewUrl: '',
    },
  ];
  const projectChildren: LuigiNode[] = [
    {
      label: 'project1',
      pathSegment: '',
      viewUrl: '',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        providePortal(),
        {
          provide: LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
          useValue: { processNodeContext: jest.fn() },
        },
        {
          provide: LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
          useValue: customGlobalNodesService,
        },
      ],
    }).compileComponents();

    service = TestBed.inject(NodesProcessingService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    luigiNodesService = TestBed.inject(LuigiNodesService);
    localConfigurationService = TestBed.inject(LocalConfigurationServiceImpl);
    configService = TestBed.inject(ConfigService);
    nodeContextProcessingService = TestBed.inject(
      LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN as any,
    );

    const portalConfig: PortalConfig = {
      providers: [{ nodes: [], creationTimestamp: '' }],
    } as unknown as PortalConfig;

    luigiCoreService.isFeatureToggleActive = jest.fn().mockReturnValue(true);
    luigiCoreService.resetLuigi = jest.fn();
    luigiCoreService.getGlobalContext = jest.fn();
    luigiCoreService.showAlert = jest.fn();
    Object.defineProperty(luigiCoreService, 'config', {
      get: jest.fn(() => ({
        settings: { btpToolLayout: true },
      })),
      configurable: true,
    });

    jest
      .spyOn(configService, 'getPortalConfig')
      .mockResolvedValue(portalConfig);

    const entityConfig = { providers: [], entityContext: {} };
    jest
      .spyOn(configService, 'getEntityConfig')
      .mockResolvedValue(entityConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('processNodes should build and flag global nodes and sort', async () => {
    // Arrange
    const baseCtx = {
      portalContext: {},
      userId: 'u',
      userEmail: 'e',
      token: 't',
      portalBaseUrl: 'x',
    } as any;

    const globalNode: LuigiNode = {
      pathSegment: 'g1',
      entityType: 'global' as any,
      context: { ...baseCtx, entityContext: { a: 1 } } as any,
    };
    const topNavNode: LuigiNode = {
      pathSegment: 't1',
      entityType: 'global-topnav' as any,
      context: { ...baseCtx } as any,
    };
    const customNode: LuigiNode = {
      pathSegment: 'c1',
      entityType: 'global' as any,
      hideFromNav: true,
      context: { ...baseCtx } as any,
    };
    customGlobalNodesService.getCustomGlobalNodes = jest
      .fn()
      .mockResolvedValue([customNode]);

    const childrenByEntity: Record<string, LuigiNode[]> = {
      global: [globalNode],
      'global.topnav': [topNavNode],
    } as any;

    const originalCtx = globalNode.context;

    // Act
    const res = await service.processNodes(childrenByEntity);
    // Assert
    expect(res.length).toBe(4);
    // new object assigned
    expect(globalNode.context).not.toBe(originalCtx);
    // global flag only for real global and not hidden
    expect(globalNode['globalNav']).toBe(true);
    expect(topNavNode['globalNav']).toBe(false);
    expect(customNode['globalNav']).toBe(false);
  });

  it('applyEntityChildrenRecursively should unset children for virtualTree nodes', () => {
    const node: LuigiNode = {
      pathSegment: 'v',
      virtualTree: true,
      children: [{ pathSegment: 'child' }],
    } as any;
    service.applyEntityChildrenRecursively(node, {}, '');
    expect(node.children).toBeUndefined();
  });

  it('should return a promise resolving entity nodes', async () => {
    // Arrange
    const retrieveEntityChildrenSpy = jest
      .spyOn(luigiNodesService, 'retrieveEntityChildren')
      .mockResolvedValue([]);

    const myentityId = 'someid';
    const userid = 'user';
    const entityNode: LuigiNode = {
      defineEntity: {
        id: entityName,
        dynamicFetchId: entityName,
        contextKey: 'myentityId',
      },
    };

    const childrenByEntity = {
      home: homeChildren,
      myentity: projectChildren,
    };

    // Act
    await service.entityChildrenProvider(
      entityNode,
      { myentityId, userid },
      childrenByEntity,
      [],
      entityName,
    );

    // Assert
    expect(retrieveEntityChildrenSpy).toHaveBeenCalledWith(
      {
        contextKey: 'myentityId',
        dynamicFetchId: entityName,
        id: entityName,
      },
      { myentity: myentityId, user: userid },
    );
  });

  it('should add parent entity ids to fetch context', async () => {
    // Arrange
    const retrieveEntityChildrenSpy = jest
      .spyOn(luigiNodesService, 'retrieveEntityChildren')
      .mockResolvedValue([]);

    const userid = 'user';

    const entityNode: LuigiNode = {
      defineEntity: {
        id: 'mysubentity',
        dynamicFetchId: 'mysubentity',
        contextKey: 'mysubentityId',
      },
    };
    (entityNode as any).parent = {
      defineEntity: {
        id: 'myparententity',
        dynamicFetchId: 'myparententity',
        contextKey: 'myparententityId',
      },
      parent: {
        defineEntity: {
          id: 'mygrandparententity',
          dynamicFetchId: 'mygrandparententity',
          contextKey: 'mygrandparententityId',
        },
      },
    };

    // Act
    const ctx = {
      mysubentityId: 'someid',
      myparententityId: 'parentid',
      mygrandparententityId: 'opa',
      userid,
    };
    await service.entityChildrenProvider(entityNode, ctx, {}, [], entityName);

    // Assert
    expect(retrieveEntityChildrenSpy).toHaveBeenCalledWith(
      {
        contextKey: 'mysubentityId',
        dynamicFetchId: 'mysubentity',
        id: 'mysubentity',
      },
      {
        mysubentity: 'someid',
        myparententity: 'parentid',
        mygrandparententity: 'opa',
        user: userid,
      },
    );
    expect(
      nodeContextProcessingService.processNodeContext,
    ).toHaveBeenCalledWith('someid', entityNode, ctx);
  });

  describe('entity children', () => {
    beforeEach(() => {
      jest
        .spyOn(localConfigurationService, 'replaceServerNodesWithLocalOnes')
        .mockImplementation((nodes: LuigiNode[], entities: string[]) => {
          return Promise.resolve(nodes);
        });
    });

    it('should apply entity children recursively', async () => {
      // Arrange
      const subsubchildren: Record<string, LuigiNode[]> = {
        someId: [
          {
            pathSegment: 'subsub',
            entityType: 'myentity.subentity.subsub',
          },
        ],
        someOtherId: [
          {
            pathSegment: 'othersubsub',
            entityType: 'myentity.subentity.subsub',
          },
        ],
      };

      jest
        .spyOn(luigiNodesService, 'retrieveEntityChildren')
        .mockImplementation(
          (
            _entityDefinition: EntityDefinition,
            additionalContext: Record<string, string>,
          ) => {
            return Promise.resolve(
              subsubchildren[additionalContext['subsub']] || [],
            );
          },
        );

      const childrenByEntity = {
        home: homeChildren,
        myentity: projectChildren,
        'myentity.subentity': [
          {
            pathSegment: 'subentityextension',
            defineEntity: {
              id: 'subsub',
              dynamicFetchId: 'subsub',
              contextKey: 'id',
            },
          },
        ],
      };

      const rootNode: LuigiNode = {
        pathSegment: 'random',
        children: [
          {
            pathSegment: 'random',
            defineEntity: {
              id: entityName,
            },
            children: [
              {
                pathSegment: 'directChild1',
                children: [
                  {
                    pathSegment: 'subentity',
                    defineEntity: {
                      id: 'subentity',
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      // Act
      service.applyEntityChildrenRecursively(rootNode, childrenByEntity, '');

      // Assert
      expect(Array.isArray(rootNode.children)).toBeFalsy();
      // @ts-ignore
      expect(Array.isArray(rootNode.children({}).children)).toBeFalsy();
      // @ts-ignore
      const entity = await rootNode.children({});
      const entityChildren = await entity[0].children({});
      expect(entityChildren.length).toBe(projectChildren.length + 1);
      expect(entityChildren[0].pathSegment).toEqual('directChild1');
      const subEntityChildren = await (
        await entityChildren[0].children({})
      )[0].children({});
      expect(subEntityChildren[0].pathSegment).toEqual('subentityextension');
      const subsubChildren = await subEntityChildren[0].children({
        id: 'someId',
      });
      expect(subsubChildren[0].pathSegment).toEqual('subsub');
      const subsubChildren2 = await subEntityChildren[0].children({
        id: 'someOtherId',
      });
      expect(subsubChildren2[0].pathSegment).toEqual('othersubsub');
      const subsubChildren3 = await subEntityChildren[0].children({
        id: 'idwithoutchildren',
      });
      expect(subsubChildren3.length).toEqual(0);
    });

    it('should filter children based on entity context', async () => {
      const rootNode: LuigiNode = {
        pathSegment: 'random',
        defineEntity: {
          id: entityName,
          contextKey: entityName,
          dynamicFetchId: entityName,
        },
        children: [
          {
            pathSegment: 'directChild1',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar1',
              },
            },
            children: [
              {
                pathSegment: 'grandChild1',
                visibleForEntityContext: {
                  myentity: {
                    foo: 'bar2',
                  },
                },
              },
            ],
          },
          {
            pathSegment: 'directChild2',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar2',
              },
            },
          },
        ],
        compound: {},
      };

      const childrenByEntity = {
        myentity: [
          {
            pathSegment: 'entityChild1',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar1',
              },
            },
          },
        ],
      };

      jest.spyOn(configService, 'getEntityConfig').mockResolvedValue({
        providers: [],
        entityContext: { foo: 'bar1' },
      });

      service.applyEntityChildrenRecursively(rootNode, childrenByEntity, '');

      const rootChildren =
        rootNode.children instanceof Function
          ? await rootNode.children({})
          : rootNode.children;
      expect(rootChildren).toMatchObject([
        { pathSegment: 'directChild1' },
        { pathSegment: 'entityChild1' },
      ]);
      const rootChildrenChildren =
        rootChildren?.[0]?.children instanceof Function
          ? await rootChildren[0].children({})
          : rootChildren?.[0]?.children;
      expect(rootChildrenChildren).toEqual([]);
    });

    it('should filter children based on context', async () => {
      const rootNode: LuigiNode = {
        pathSegment: 'random',
        defineEntity: {
          id: entityName,
          contextKey: entityName,
          dynamicFetchId: entityName,
        },
        children: [
          {
            pathSegment: 'directChild1',
            visibleForContext: 'entityContext.myentity.foo == `bar1`',
            children: [
              {
                pathSegment: 'grandChild1',
                visibleForContext: 'entityContext.myentity.foo == `bar2`',
              },
            ],
          },
          {
            pathSegment: 'directChild2',
            visibleForContext: 'entityContext.myentity.foo == `bar2`',
          },
        ],
      };

      const childrenByEntity = {
        myentity: [
          {
            pathSegment: 'entityChild1',
            visibleForEntityContext: {
              myentity: {
                foo: 'bar1',
              },
            },
          },
        ],
      };

      jest.spyOn(configService, 'getEntityConfig').mockResolvedValue({
        providers: [],
        entityContext: { foo: 'bar1' },
      });

      service.applyEntityChildrenRecursively(rootNode, childrenByEntity, '');

      // @ts-ignore
      const rootChildren = await rootNode.children({});
      expect(rootChildren).toMatchObject([
        { pathSegment: 'directChild1' },
        { pathSegment: 'entityChild1' },
      ]);
      expect(await rootChildren[0].children({})).toEqual([]);
    });

    it('should handle compound children: merge entity context and filter', async () => {
      const rootNode: LuigiNode = {
        pathSegment: 'root',
        defineEntity: {
          id: 'myentity',
          contextKey: 'myentity',
          dynamicFetchId: 'myentity',
        },
        compound: {
          children: [
            {
              pathSegment: 'keep',
              context: { entityContext: {} },
              visibleForContext: 'entityContext.foo == `bar`',
            } as any,
            {
              pathSegment: 'drop',
              context: { entityContext: {} },
              visibleForContext: 'entityContext.foo == `nope`',
            } as any,
          ],
        },
        context: { entityContext: { foo: 'bar' } },
      } as any;

      service.applyEntityChildrenRecursively(rootNode, {}, '');
      const compoundChildren = (rootNode as any).compound
        .children as LuigiNode[];
      expect(compoundChildren.length).toBe(1);
      expect(compoundChildren[0].pathSegment).toBe('keep');
      expect(compoundChildren[0]?.context?.entityContext?.foo).toBe('bar');
    });

    it('createChildrenList partitions dynamic children and merges by entity', async () => {
      const staticChild: LuigiNode = { pathSegment: 'static' } as any;
      const entityNode: LuigiNode = {
        defineEntity: {
          id: 'typeA',
          dynamicFetchId: 'typeA',
          contextKey: 'id',
        },
      } as any;
      const childrenByEntity: Record<string, LuigiNode[]> = {
        typeA: [staticChild],
        typeB: [{ pathSegment: 'existingB', entityType: 'typeB' } as any],
      } as any;

      jest
        .spyOn(luigiNodesService, 'retrieveEntityChildren')
        .mockResolvedValue([
          { pathSegment: 'root1', entityType: 'typeA' } as any,
          { pathSegment: 'err', entityType: 'entity.error' as any } as any,
          staticChild,
          { pathSegment: 'childOfOther', entityType: 'typeB' } as any,
          { pathSegment: 'noType' } as any,
        ]);

      const list = await service.entityChildrenProvider(
        entityNode,
        { id: '1' },
        childrenByEntity,
        [],
        'typeA',
      );

      // Expect that list contains only root children category
      const segs = list.map((n) => n.pathSegment);
      expect(segs).toEqual(expect.arrayContaining(['static', 'root1', 'err']));
    });
  });

  it('processNodeDefineEntity should alert and throw when defineEntity is missing', () => {
    const node = { pathSegment: 'n1' } as LuigiNode;
    expect(() =>
      (service as any).processNodeDefineEntity(node, {}, '', []),
    ).toThrow('Node defineEntity is missing');
    expect(luigiCoreService.showAlert).toHaveBeenCalledWith({
      text: 'Node defineEntity is missing',
      type: 'error',
    });
  });

  it('entityChildrenProvider should use static path when dynamicFetchId is missing', async () => {
    const directChild: LuigiNode = { pathSegment: 'direct' } as any;
    const entityNode: LuigiNode = {
      defineEntity: { id: 'typeA' },
    } as any;
    const childrenByEntity = { typeA: [{ pathSegment: 'byEntity' } as any] };

    const list = await service.entityChildrenProvider(
      entityNode,
      {},
      childrenByEntity as any,
      [directChild],
      'typeA',
    );

    const segs = list.map((n) => n.pathSegment);
    expect(segs).toEqual(expect.arrayContaining(['direct', 'byEntity']));
  });

  it('entityChildrenProvider should fall back to static children when dynamic fetch fails', async () => {
    jest
      .spyOn(luigiNodesService, 'retrieveEntityChildren')
      .mockRejectedValue(new Error('boom'));

    const directChild: LuigiNode = { pathSegment: 'direct' } as any;
    const entityNode: LuigiNode = {
      defineEntity: { id: 'typeA', dynamicFetchId: 'typeA', contextKey: 'id' },
    } as any;

    const childrenByEntity = { typeA: [{ pathSegment: 'byEntity' } as any] };

    const list = await service.entityChildrenProvider(
      entityNode,
      { id: '1' },
      childrenByEntity as any,
      [directChild],
      'typeA',
    );

    const segs = list.map((n) => n.pathSegment);
    // dynamic failed, so only static roots should appear
    expect(segs).toEqual(expect.arrayContaining(['direct', 'byEntity']));
  });
});

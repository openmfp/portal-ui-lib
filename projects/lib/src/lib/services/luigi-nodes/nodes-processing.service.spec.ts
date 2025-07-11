import { EntityDefinition, LuigiNode, PortalConfig } from '../../models';
import { providePortal } from '../../portal-providers';
import { LuigiCoreService } from '../luigi-core.service';
import { ConfigService } from '../portal';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeContextProcessingService } from './node-context-processing.service';
import { NodesProcessingService } from './nodes-processing.service';
import { TestBed } from '@angular/core/testing';

describe('NodesProcessingService', () => {
  let service: NodesProcessingService;
  let luigiNodesService: LuigiNodesService;
  let luigiCoreService: LuigiCoreService;
  let configService: ConfigService;
  let nodeContextProcessingService: NodeContextProcessingService;
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
          provide: NodeContextProcessingService,
          useValue: { readAndStoreEntityInNodeContext: jest.fn() },
        },
      ],
    }).compileComponents();

    service = TestBed.inject(NodesProcessingService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    luigiNodesService = TestBed.inject(LuigiNodesService);
    configService = TestBed.inject(ConfigService);
    nodeContextProcessingService = TestBed.inject(NodeContextProcessingService);

    const portalConfig: PortalConfig = {
      providers: [{ nodes: [], creationTimestamp: '' }],
    } as PortalConfig;

    luigiCoreService.isFeatureToggleActive = jest.fn().mockReturnValue(true);
    luigiCoreService.resetLuigi = jest.fn();
    luigiCoreService.getGlobalContext = jest.fn();
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

  it('should return a promise resolving entity nodes', async () => {
    // Arrange
    const retrieveAndMergeEntityChildrenSpy = jest
      .spyOn(luigiNodesService, 'retrieveAndMergeEntityChildren')
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
      undefined,
      entityName,
    );

    // Assert
    expect(retrieveAndMergeEntityChildrenSpy).toHaveBeenCalledWith(
      {
        contextKey: 'myentityId',
        dynamicFetchId: entityName,
        id: entityName,
      },
      childrenByEntity.myentity,
      entityName,
      { myentity: myentityId, user: userid },
    );
  });

  it('should add parent entity ids to fetch context', async () => {
    // Arrange
    const retrieveAndMergeEntityChildrenSpy = jest
      .spyOn(luigiNodesService, 'retrieveAndMergeEntityChildren')
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
    await service.entityChildrenProvider(
      entityNode,
      ctx,
      {},
      undefined,
      entityName,
    );

    // Assert
    expect(retrieveAndMergeEntityChildrenSpy).toHaveBeenCalledWith(
      {
        contextKey: 'mysubentityId',
        dynamicFetchId: 'mysubentity',
        id: 'mysubentity',
      },
      [],
      entityName,
      {
        mysubentity: 'someid',
        myparententity: 'parentid',
        mygrandparententity: 'opa',
        user: userid,
      },
    );
    expect(
      nodeContextProcessingService.readAndStoreEntityInNodeContext,
    ).toHaveBeenCalledWith('someid', entityNode, ctx);
  });

  describe('entity children', () => {
    beforeEach(() => {
      jest
        .spyOn(luigiNodesService, 'replaceServerNodesWithLocalOnes')
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
        .spyOn(luigiNodesService, 'retrieveAndMergeEntityChildren')
        .mockImplementation(
          (
            _entityDefinition: EntityDefinition,
            _existingChildren: LuigiNode[],
            parentEntityPath: string,
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
        rootChildren[0].children instanceof Function
          ? await rootChildren[0].children({})
          : rootChildren[0].children;
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
  });
});

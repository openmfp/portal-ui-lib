import { TestBed } from '@angular/core/testing';
import { EntityDefinition, LuigiNode, PortalConfig } from '../../models';
import { providePortal } from '../../portal-providers';
import { ConfigService } from '../portal';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodesProcessingService } from './nodes-processing.service';

describe('NodesProcessingService', () => {
  let service: NodesProcessingService;
  let luigiNodesService: LuigiNodesService;
  let luigiCoreService: LuigiCoreService;
  let configService: ConfigService;
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
      providers: [providePortal()],
    }).compileComponents();

    service = TestBed.inject(NodesProcessingService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    luigiNodesService = TestBed.inject(LuigiNodesService);
    configService = TestBed.inject(ConfigService);

    const portalConfig: PortalConfig = {
      providers: [{ nodes: [], creationTimestamp: '' }],
    } as PortalConfig;

    luigiCoreService.isFeatureToggleActive = jest.fn().mockReturnValue(true);
    luigiCoreService.resetLuigi = jest.fn();
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
      entityName
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
      { myentity: myentityId, user: userid }
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
    await service.entityChildrenProvider(
      entityNode,
      {
        mysubentityId: 'someid',
        myparententityId: 'parentid',
        mygrandparententityId: 'opa',
        userid,
      },
      {},
      undefined,
      entityName
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
        myparententity: 'parentid',
        mygrandparententity: 'opa',
        mysubentity: 'someid',
        user: userid,
      }
    );
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
            additionalContext: Record<string, string>
          ) => {
            return Promise.resolve(
              subsubchildren[additionalContext['subsub']] || []
            );
          }
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
        compound: {}
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

  describe('addBtpLayoutNavigationHeader', () => {
    it('should not add navHeader when entityNode has no defineEntity', () => {
      // Arrange
      const entityNode: LuigiNode = {
        pathSegment: 'test',
      };

      // Act
      service.addBtpLayoutNavigationHeader(entityNode);

      // Assert
      expect(entityNode.navHeader).toBeUndefined();
    });

    it('should not add navHeader when btpToolLayout is disabled', () => {
      // Arrange
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
      };

      Object.defineProperty(luigiCoreService, 'config', {
        get: jest.fn(() => ({
          settings: { btpToolLayout: false },
        })),
      });

      // Act
      service.addBtpLayoutNavigationHeader(entityNode);

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
      };

      // Act
      service.addBtpLayoutNavigationHeader(entityNode);

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
      };

      // Act
      service.addBtpLayoutNavigationHeader(entityNode);

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
        };
        containerElement = document.createElement('div');
      });

      it('should not modify container if navHeader label is missing', () => {
        // Arrange
        service.addBtpLayoutNavigationHeader(entityNode);
        const originalHTML = containerElement.innerHTML;

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          {}
        );

        // Assert
        expect(containerElement.innerHTML).toBe(originalHTML);
      });

      it('should render header with correct structure and content', () => {
        // Arrange
        service.addBtpLayoutNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label' };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader
        );

        // Assert
        expect(containerElement.classList.contains('entity-nav-header')).toBe(
          true
        );
        expect(
          containerElement.querySelector('.entity-nav-header-type')
        ).toBeDefined();
        expect(
          containerElement.querySelector('.entity-nav-header-label')
        ).toBeDefined();
        expect(containerElement.innerHTML).toContain('Test Entity');
        expect(containerElement.innerHTML).toContain('Test Label');
      });

      it('should use "Component" if entity label is set to "component', () => {
        // Arrange
        entityNode.defineEntity.label = "component";
        service.addBtpLayoutNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label' };

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader
        );

        // Assert
        expect(containerElement.innerHTML).toContain('Component');
      });

      it('should use "Product" for product-type projects', () => {
        // Arrange
        entityNode.defineEntity.label = "Project";
        service.addBtpLayoutNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label', context: {entityContext: {project: {type: 'product'}} }};

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader
        );

        // Assert
        expect(containerElement.innerHTML).toContain('Product');
      });

      it('should use "Experiment" for experiment-type projects', () => {
        // Arrange
        entityNode.defineEntity.label = "Project";
        service.addBtpLayoutNavigationHeader(entityNode);
        const navHeader = { label: 'Test Label', context: {entityContext: {project: {type: 'experiment'}} }};

        // Act
        entityNode.navHeader.renderer(
          containerElement,
          entityNode,
          () => {},
          navHeader
        );

        // Assert
        expect(containerElement.innerHTML).toContain('Experiment');
      });
    });
  });
});

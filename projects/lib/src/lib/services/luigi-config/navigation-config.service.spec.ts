import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { ClientEnvironment, PortalConfig } from '../../models';
import { ConfigService, EnvConfigService } from '../portal';
import { LuigiCoreService } from '../luigi-core.service';
import { IntentNavigationService } from '../luigi-nodes/intent-navigation.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { NodesProcessingService } from '../luigi-nodes/nodes-processing.service';
import { NavigationGlobalContextConfigService } from './navigation-global-context-config.service';
import { HeaderBarService } from './luigi-breadcrumb-config.service';
import { NavigationConfigService } from './navigation-config.service';

describe('NavigationConfigService', () => {
  let service: NavigationConfigService;
  let luigiCoreService: LuigiCoreService;
  let configService: ConfigService;
  let envConfigService: EnvConfigService;
  let nodesProcessingService: jest.Mocked<NodesProcessingService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NavigationConfigService,
        {
          provide: ConfigService,
          useValue: {
            getPortalConfig: jest.fn(),
            getEntityConfig: jest.fn(),
          },
        },
        {
          provide: LuigiCoreService,
          useValue: {
            setFeatureToggles: jest.fn(),
            setFeatureToggle: jest.fn(),
            resetLuigi: jest.fn(),
          },
        },
        { provide: LuigiNodesService, useValue: { nodePolicyResolver: jest.fn().mockReturnValue(true) } },
        { provide: IntentNavigationService, useValue: { buildIntentMappings: jest.fn().mockReturnValue({}) } },
        {
          provide: NavigationGlobalContextConfigService,
          useValue: { getGlobalContext: jest.fn().mockResolvedValue({}) },
        },
        { provide: HeaderBarService, useValue: { getConfig: jest.fn().mockResolvedValue(undefined) } },
        {
          provide: NodesProcessingService,
          useValue: { processNodes: jest.fn().mockResolvedValue([]) },
        },
        { provide: EnvConfigService, useValue: { getEnvConfig: jest.fn() } },
      ],
    }).compileComponents();

    service = TestBed.inject(NavigationConfigService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    envConfigService = TestBed.inject(EnvConfigService);
    configService = TestBed.inject(ConfigService);
    nodesProcessingService = TestBed.inject(
      NodesProcessingService,
    ) as jest.Mocked<NodesProcessingService>;

    const portalConfig: PortalConfig = {
      providers: [{ nodes: [], creationTimestamp: '' }],
    } as PortalConfig;

    (luigiCoreService.resetLuigi as any) = luigiCoreService.resetLuigi || jest.fn();

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

  describe('Tests which need service setup', () => {
    const envConfig = mock<ClientEnvironment>();
    beforeEach(async () => {
      const portalConfig = mock<PortalConfig>({
        portalContext: {
          extensionManagerMissingMandatoryDataUrl:
            '/missing-mandatory-data/:extClassName',
        },
      });
      jest.spyOn(envConfigService, 'getEnvConfig').mockResolvedValue(envConfig);
      jest
        .spyOn(configService, 'getPortalConfig')
        .mockResolvedValue(portalConfig);
      jest
        .spyOn(luigiCoreService, 'setFeatureToggle')
        .mockImplementation(() => undefined);
    });

    it('should create the view groups correctly', async () => {
      // Arrange
      const childrenByEntity = {
        home: [
          {
            label: 'foo',
            viewGroup: 'abc',
            _preloadUrl: 'preload',
            _requiredIFramePermissionsForViewGroup: {
              allow: ['allow'],
            },
          },
        ],
        project: [],
      };

      // Act
      const navigation = await service.getNavigationConfig(
        childrenByEntity,
        envConfig
      );

      // Assert
      expect(navigation.viewGroupSettings).toEqual({
        abc: {
          preloadUrl: 'preload',
          requiredIFramePermissions: {
            allow: ['allow'],
          },
        },
      });
    });
  });
});

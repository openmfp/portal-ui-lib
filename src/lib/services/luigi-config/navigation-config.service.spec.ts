import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { ClientEnvironment, PortalConfig, ServiceProvider } from '../../models';
import { providePortal } from '../../portal-providers';
import {
  ConfigService,
  EnvConfigService,
  ServiceProviderService,
} from '../portal';
import { LuigiCoreService } from '../luigi-core.service';
import { NavigationConfigService } from './navigation-config.service';

jest.mock('../../initializers', () => ({
  ...jest.requireActual('../../initializers'),
  provideBootstrap: jest.fn().mockReturnValue({
    provide: 'PR',
    useFactory: () => console.log('HERE'),
  }),
}));

describe('NavigationConfigService', () => {
  let service: NavigationConfigService;
  let luigiCoreService: LuigiCoreService;
  let configService: ConfigService;
  let envConfigService: EnvConfigService;
  let serviceProviderService: ServiceProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [providePortal()],
    }).compileComponents();

    service = TestBed.inject(NavigationConfigService);
    luigiCoreService = TestBed.inject(LuigiCoreService);
    envConfigService = TestBed.inject(EnvConfigService);
    serviceProviderService = TestBed.inject(ServiceProviderService);
    configService = TestBed.inject(ConfigService);

    const serviceProviders: ServiceProvider[] = [
      { nodes: [], config: {}, creationTimestamp: '' },
    ];
    luigiCoreService.isFeatureToggleActive = jest.fn().mockReturnValue(true);
    luigiCoreService.resetLuigi = jest.fn();

    jest
      .spyOn(serviceProviderService, 'getRawConfigs')
      .mockResolvedValue(serviceProviders);

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
        .mockImplementation(() => {});
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

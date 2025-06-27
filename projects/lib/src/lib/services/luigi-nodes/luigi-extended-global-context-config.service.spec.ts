import { AuthService, ConfigService, EnvConfigService } from '../portal';
import { ResourceService } from '../resource';
import { OpenmfpLuigiExtendedGlobalContextConfigService } from './luigi-extended-global-context-config.service';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

jest.mock('../portal');
jest.mock('../resource');

describe('OpenmfpLuigiExtendedGlobalContextConfigService', () => {
  let service: OpenmfpLuigiExtendedGlobalContextConfigService;
  let mockResourceService: jest.Mocked<ResourceService>;
  let mockEnvConfigService: jest.Mocked<EnvConfigService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    const resourceServiceMock = {
      read: jest.fn(),
    } as jest.Mocked<Partial<ResourceService>>;

    const envConfigServiceMock = {
      getEnvConfig: jest.fn(),
    } as jest.Mocked<Partial<EnvConfigService>>;

    const configServiceMock = {
      getPortalConfig: jest.fn(),
    } as jest.Mocked<Partial<ConfigService>>;

    const authServiceMock = {
      getToken: jest.fn(),
    } as jest.Mocked<Partial<AuthService>>;

    TestBed.configureTestingModule({
      providers: [
        OpenmfpLuigiExtendedGlobalContextConfigService,
        { provide: ResourceService, useValue: resourceServiceMock },
        { provide: EnvConfigService, useValue: envConfigServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(OpenmfpLuigiExtendedGlobalContextConfigService);
    mockResourceService = TestBed.inject(
      ResourceService,
    ) as jest.Mocked<ResourceService>;
    mockEnvConfigService = TestBed.inject(
      EnvConfigService,
    ) as jest.Mocked<EnvConfigService>;
    mockConfigService = TestBed.inject(
      ConfigService,
    ) as jest.Mocked<ConfigService>;
    mockAuthService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  it('should return organizationId with the same entityId when resource is successfully read', async () => {
    const mockPortalConfig = {
      portalContext: {
        crdGatewayApiUrl: 'https://api.example.com/graphql',
      },
    } as any;
    const mockEnvConfig = {
      organization: 'test-org',
    } as any;
    const mockResource = {
      metadata: {
        annotations: {
          'kcp.io/cluster': 'cluster-123',
        },
      },
    } as any;
    const mockToken = 'mock-token';

    mockConfigService.getPortalConfig.mockResolvedValue(mockPortalConfig);
    mockEnvConfigService.getEnvConfig.mockResolvedValue(mockEnvConfig);
    mockAuthService.getToken.mockReturnValue(mockToken);
    mockResourceService.read.mockReturnValue(of(mockResource));

    const result = await service.createLuigiExtendedGlobalContext();

    expect(result).toEqual({
      organizationId: 'cluster-123/test-org',
      entityId: 'cluster-123/test-org',
    });

    expect(mockResourceService.read).toHaveBeenCalledWith(
      'test-org',
      'core_openmfp_org',
      'Account',
      'query ($name: String!) { core_openmfp_org { Account(name: $name) { metadata { name annotations } } }}',
      {
        portalContext: {
          crdGatewayApiUrl: 'https://api.example.com/graphql',
        },
        token: 'mock-token',
        accountId: 'test-org',
      },
    );
  });

  it('should return empty object when resource read fails', async () => {
    const mockPortalConfig = {
      portalContext: {
        crdGatewayApiUrl: 'https://api.example.com/graphql',
      },
    } as any;
    const mockEnvConfig = {
      organization: 'test-org',
    } as any;
    const mockToken = 'mock-token';

    mockConfigService.getPortalConfig.mockResolvedValue(mockPortalConfig);
    mockEnvConfigService.getEnvConfig.mockResolvedValue(mockEnvConfig);
    mockAuthService.getToken.mockReturnValue(mockToken);
    mockResourceService.read.mockReturnValue(
      throwError(() => new Error('API Error')),
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await service.createLuigiExtendedGlobalContext();

    expect(result).toEqual({});
    expect(consoleSpy).toHaveBeenCalledWith(
      'Not able to read entity test-org from core_openmfp_org',
    );

    consoleSpy.mockRestore();
  });
});

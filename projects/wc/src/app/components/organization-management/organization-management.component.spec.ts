import { OrganizationManagementComponent } from './organization-management.component';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  input,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MutationResult } from '@apollo/client';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { NodeContext, ResourceService } from '@openmfp/portal-ui-lib';
import {
  EnvConfigService,
  I18nService,
  LuigiCoreService,
} from '@openmfp/portal-ui-lib';
import { LuigiGlobalContext } from '@openmfp/portal-ui-lib';
import { ClientEnvironment } from '@openmfp/portal-ui-lib';
import { of, throwError } from 'rxjs';

describe('OrganizationManagementComponent', () => {
  let component: OrganizationManagementComponent;
  let fixture: ComponentFixture<OrganizationManagementComponent>;
  let resourceServiceMock: jest.Mocked<ResourceService>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let envConfigServiceMock: jest.Mocked<EnvConfigService>;
  let luigiClientMock: jest.Mocked<LuigiClient>;

  beforeEach(async () => {
    resourceServiceMock = {
      readOrganizations: jest.fn(),
      create: jest.fn(),
    } as any;

    i18nServiceMock = {
      translationTable: {},
      getTranslation: jest.fn(),
    } as any;

    luigiCoreServiceMock = {
      getGlobalContext: jest.fn(),
      showAlert: jest.fn(),
    } as any;

    envConfigServiceMock = {
      getEnvConfig: jest.fn(),
    } as any;

    luigiClientMock = {
      uxManager: jest.fn().mockReturnValue({
        showAlert: jest.fn(),
      }),
    } as any;

    await TestBed.configureTestingModule({
      imports: [OrganizationManagementComponent, FormsModule],
      providers: [
        { provide: ResourceService, useValue: resourceServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        { provide: EnvConfigService, useValue: envConfigServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    })
      .overrideComponent(OrganizationManagementComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrganizationManagementComponent);
    component = fixture.componentInstance;
    component.LuigiClient = (() => luigiClientMock) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should react to context input change', () => {
    const mockContext = {
      translationTable: { hello: 'world' },
    } as any as NodeContext;

    resourceServiceMock.readOrganizations.mockReturnValue(of({} as any));

    const contextSignal = signal<NodeContext | null>(mockContext);
    component.context = contextSignal as any;

    fixture.detectChanges();

    expect(component['i18nService'].translationTable).toEqual(
      mockContext.translationTable,
    );
  });

  it('should initialize with empty organizations', () => {
    expect(component.organizations()).toEqual([]);
  });

  it('should read organizations on init', () => {
    const mockOrganizations = {
      Accounts: [
        { metadata: { name: 'org1' } },
        { metadata: { name: 'org2' } },
      ],
    };
    const mockGlobalContext: LuigiGlobalContext = {
      portalContext: {},
      userId: 'user1',
      userEmail: 'user@test.com',
      token: 'token',
      organization: 'org1',
      portalBaseUrl: 'https://test.com',
    };
    luigiCoreServiceMock.getGlobalContext.mockReturnValue(mockGlobalContext);
    resourceServiceMock.readOrganizations.mockReturnValue(
      of(mockOrganizations as any),
    );

    component.ngOnInit();

    expect(resourceServiceMock.readOrganizations).toHaveBeenCalled();
    expect(component.organizations()).toEqual(['org2']);
  });

  it('should set organization to switch', () => {
    const event = { target: { value: 'testOrg' } };
    component.setOrganizationToSwitch(event);
    expect(component.organizationToSwitch).toBe('testOrg');
  });

  it('should onboard new organization successfully', () => {
    const mockResponse: MutationResult<void> = {
      data: undefined,
      loading: false,
      error: undefined,
      called: true,
      client: {} as any,
      reset: jest.fn(),
    };
    resourceServiceMock.create.mockReturnValue(of(mockResponse));
    component.newOrganization = 'newOrg';
    component.organizations.set(['existingOrg']);

    component.onboardOrganization();

    expect(resourceServiceMock.create).toHaveBeenCalled();
    expect(component.organizations()).toEqual(['newOrg', 'existingOrg']);
    expect(component.organizationToSwitch).toBe('newOrg');
    expect(component.newOrganization).toBe('');
    expect(luigiClientMock.uxManager().showAlert).toHaveBeenCalled();
  });

  it('should handle organization creation error', () => {
    resourceServiceMock.create.mockReturnValue(
      throwError(() => new Error('Creation failed')),
    );
    component.newOrganization = 'newOrg';

    component.onboardOrganization();

    expect(luigiCoreServiceMock.showAlert).toHaveBeenCalledWith({
      text: 'Failure! Could not create organization: newOrg.',
      type: 'error',
    });
  });

  it('should switch organization', async () => {
    const mockEnvConfig: ClientEnvironment = {
      idpName: 'test',
      organization: 'test',
      oauthServerUrl: 'https://test.com',
      clientId: 'test',
      baseDomain: 'test.com',
      isLocal: false,
      developmentInstance: false,
      authData: {
        expires_in: '3600',
        access_token: 'test-access-token',
        id_token: 'test-id-token',
      },
    };
    envConfigServiceMock.getEnvConfig.mockResolvedValue(mockEnvConfig);
    component.organizationToSwitch = 'newOrg';
    Object.defineProperty(window, 'location', {
      value: { protocol: 'https:', port: '8080' },
      writable: true,
    });

    await component.switchOrganization();

    expect(window.location.href).toBe('https://newOrg.test.com:8080');
  });
});

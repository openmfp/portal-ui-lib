import { DetailViewComponent } from './detail-view.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GatewayService,
  NodeContext,
  Resource,
  ResourceDefinition,
  ResourceService,
} from '@openmfp/portal-ui-lib';
import { Condition } from 'kubernetes-types/meta/v1';
import { of } from 'rxjs';

describe('DetailViewComponent', () => {
  let component: DetailViewComponent;
  let fixture: ComponentFixture<DetailViewComponent>;
  let mockResourceService: any;
  let mockGatewayService: any;
  let mockLuigiClient: any;
  let mockAnchorElement: HTMLAnchorElement;

  const mockResourceDefinition: ResourceDefinition = {
    group: 'test.group',
    plural: 'resources',
    singular: 'resource',
    kind: 'Resource',
    ui: {
      detailView: {
        fields: [
          { label: 'Description', property: 'spec.description' },
          { label: 'Created At', property: 'metadata.creationTimestamp' },
        ],
      },
    },
  };

  const mockContext = {
    resourceDefinition: mockResourceDefinition,
    token: 'test-token',
    resourceId: 'resource-1',
    parentNavigationContexts: ['parent-context'],
    portalContext: {
      crdGatewayApiUrl: 'https://example.com/api/namespaces/test:test/graphql',
    },
  } as NodeContext;

  const mockResource: Resource = {
    metadata: {
      name: 'resource-1',
      creationTimestamp: '2023-01-01T00:00:00Z',
    },
    spec: {
      type: 'resource',
      displayName: 'Test Resource',
      description: 'Test resource description',
    },
    status: {
      conditions: [{ type: 'Ready', status: 'True' } as Condition],
    },
  };

  beforeEach(async () => {
    mockResourceService = {
      read: jest.fn().mockReturnValue(of(mockResource)),
      readKcpCA: jest.fn().mockReturnValue(of('kcpCA')),
    };

    mockGatewayService = {
      getKcpPath: jest.fn().mockReturnValue('test:test:resource-1'),
    };

    mockLuigiClient = {
      linkManager: jest.fn().mockReturnValue({
        fromContext: jest.fn().mockReturnValue({
          navigate: jest.fn(),
        }),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [DetailViewComponent],
      providers: [
        { provide: ResourceService, useValue: mockResourceService },
        { provide: GatewayService, useValue: mockGatewayService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailViewComponent);
    component = fixture.componentInstance;
    component.LuigiClient = mockLuigiClient;
    component.context = (() => mockContext) as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set resourceFields and resourceDefinition from context', () => {
    expect(component.resourceFields).toEqual(
      mockResourceDefinition.ui!.detailView!.fields,
    );
    expect(component.resourceDefinition).toEqual(mockResourceDefinition);
  });

  it('should set workspacePath using gatewayService', () => {
    expect(mockGatewayService.getKcpPath).toHaveBeenCalled();
    expect(component.workspacePath).toBe('test:test:resource-1');
  });

  it('should load resource data on initialization', () => {
    // component.ngOnInit();

    expect(mockResourceService.read).toHaveBeenCalledWith(
      'resource-1',
      'test_group_resource',
      expect.any(Object),
    );

    expect(component.resource()).toEqual(mockResource);
  });

  it('should navigate to parent context', () => {
    component.navigateToParent();

    expect(mockLuigiClient.linkManager).toHaveBeenCalled();
    expect(mockLuigiClient.linkManager().fromContext).toHaveBeenCalledWith(
      'parent-context',
    );
    expect(
      mockLuigiClient.linkManager().fromContext().navigate,
    ).toHaveBeenCalledWith('/');
  });

  it('should download kubeconfig', async () => {
    mockAnchorElement = document.createElement('a');
    jest.spyOn(mockAnchorElement, 'click');
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchorElement);

    global.URL.createObjectURL = jest.fn().mockReturnValue('blob-url');

    await component.downloadKubeConfig();

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.href).toEqual('http://localhost/blob-url');
    expect(mockAnchorElement.download).toBe('kubeconfig.yaml');
    expect(mockAnchorElement.click).toHaveBeenCalled();
  });

  it('should handle empty detailView fields in resourceDefinition', () => {
    const newContext = { ...mockContext };
    newContext.resourceDefinition = { ...mockResourceDefinition };
    newContext.resourceDefinition.ui = { detailView: { fields: [] } };

    component.context = (() => newContext) as any;

    expect(component.resourceFields).toEqual([]);
  });

  it('should handle missing detailView in resourceDefinition', () => {
    const newContext = { ...mockContext };
    newContext.resourceDefinition = { ...mockResourceDefinition };
    delete newContext.resourceDefinition.ui;

    component.context = (() => newContext) as any;

    expect(component.resourceFields).toEqual([
      {
        jsonPathExpression: 'status.conditions[?(@.type=="Ready")].status',
        label: 'Workspace Status',
        property: ['status.conditions.status', 'status.conditions.type'],
      },
    ]);
  });

  it('should use gatewayService for KCP path in kubeconfig download', async () => {
    mockAnchorElement = document.createElement('a');
    jest.spyOn(mockAnchorElement, 'click');
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchorElement);
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob-url');

    await component.downloadKubeConfig();

    expect(mockGatewayService.getKcpPath).toHaveBeenCalled();
  });
});

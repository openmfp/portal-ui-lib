import { NodeContext, Resource, ResourceDefinition } from '../models/resource';
import { ResourceService } from '../services/resource.service';
import { ListViewComponent } from './list-view.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';
import { of, throwError } from 'rxjs';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let resourceServiceMock: jest.Mocked<ResourceService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let luigiClientMock: any;

  const mockResourceDefinition: ResourceDefinition = {
    group: 'test.group',
    plural: 'resources',
    kind: 'Resource',
    scope: 'Namespaced',

    ui: {
      listView: {
        columns: [
          { property: 'metadata.name', label: 'Name' },
          { property: 'status.phase', label: 'Status' },
        ],
      },
      createView: {
        fields: [{ property: 'metadata.name', label: 'Name', required: true }],
      },
    },
  };

  const mockNodeContext: NodeContext = {
    resourceDefinition: mockResourceDefinition,
  };

  const mockResources: Resource[] = [
    {
      metadata: { name: 'resource-1' },
      status: { phase: 'Running' },
    },
    {
      metadata: { name: 'resource-2' },
      status: { phase: 'Pending' },
    },
  ];

  beforeEach(async () => {
    const resourceService = {
      read: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const luigiCoreService = {
      showAlert: jest.fn(),
    };

    luigiClientMock = {
      linkManager: jest.fn().mockReturnValue({
        navigate: jest.fn(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ListViewComponent],
      providers: [
        { provide: ResourceService, useValue: resourceService },
        { provide: LuigiCoreService, useValue: luigiCoreService },
      ],
    }).compileComponents();

    resourceServiceMock = TestBed.inject(
      ResourceService,
    ) as jest.Mocked<ResourceService>;
    luigiCoreServiceMock = TestBed.inject(
      LuigiCoreService,
    ) as jest.Mocked<LuigiCoreService>;

    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;

    document.body.innerHTML = '<div class="wcContainer"></div>';

    component.LuigiClient = luigiClientMock;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the context correctly', () => {
    component.context = mockNodeContext;

    expect(component.resourceDefinition).toBe(mockResourceDefinition);
    expect(component.columns).toBe(mockResourceDefinition.ui.listView.columns);
    expect(component.heading).toBe('Resources');
  });

  it('should use default columns when ui columns are not defined', () => {
    const contextWithoutUiColumns: NodeContext = {
      resourceDefinition: {
        ...mockResourceDefinition,
        ui: undefined,
      },
    };

    component.context = contextWithoutUiColumns;

    expect(component.columns).toEqual([
      { property: 'metadata.name', label: 'Name' },
      {
        property: 'status.conditions[?(@.type=="Ready")].status',
        label: 'Ready',
      },
    ]);
  });

  it('should fetch resources on init', () => {
    component.context = mockNodeContext;
    const queryResult = { data: { test_group_resources: mockResources } };
    resourceServiceMock.read.mockReturnValue(of(queryResult));

    component.ngOnInit();

    expect(resourceServiceMock.read).toHaveBeenCalledWith(
      'test_group_resources',
      [{ metadata: ['name'] }, { status: ['phase'] }],
    );
    expect(component.resources).toEqual(mockResources);
  });

  it('should handle error when fetching resources', () => {
    component.context = mockNodeContext;
    const testError = new Error('Test error');
    resourceServiceMock.read.mockReturnValue(throwError(() => testError));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error executing GraphQL query',
      testError,
    );
    consoleSpy.mockRestore();
  });

  it('should delete a resource', () => {
    component.context = mockNodeContext;
    const resource = mockResources[0];
    const mockEvent = { stopPropagation: jest.fn() };
    resourceServiceMock.delete.mockReturnValue(of({}));
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

    component.delete(mockEvent, resource);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(resourceServiceMock.delete).toHaveBeenCalledWith(
      resource,
      mockResourceDefinition,
    );
    expect(consoleSpy).toHaveBeenCalledWith('Resource deleted.');
    consoleSpy.mockRestore();
  });

  it('should show alert when delete fails', () => {
    component.context = mockNodeContext;
    const resource = mockResources[0];
    const mockEvent = { stopPropagation: jest.fn() };
    const testError = new Error('Delete error');
    resourceServiceMock.delete.mockReturnValue(throwError(() => testError));

    component.delete(mockEvent, resource);

    expect(luigiCoreServiceMock.showAlert).toHaveBeenCalledWith({
      text: 'Failure! Could not delete resource: resource-1.',
      type: 'error',
    });
  });

  it('should navigate to resource details', () => {
    const resource = mockResources[0];
    const navigateSpy = jest.fn();
    luigiClientMock.linkManager.mockReturnValue({ navigate: navigateSpy });

    component.navigateToResource(resource);

    expect(luigiClientMock.linkManager).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('resource-1');
  });

  it('should get nested value using jsonpath', () => {
    const resource = mockResources[0];
    const column = { property: 'metadata.name', label: 'Name' };

    const result = component.getNestedValue(resource, column);

    expect(result).toBe('resource-1');
  });

  it('should return undefined for non-existent nested values', () => {
    const resource = mockResources[0];
    const column = { property: 'some.non.existent.path', label: 'Missing' };

    const result = component.getNestedValue(resource, column);

    expect(result).toBeUndefined();
  });

  it('should add ui5 density class on init', () => {
    component.context = mockNodeContext;
    resourceServiceMock.read.mockReturnValue(of({ data: {} }));

    component.ngOnInit();

    const wcContainer = document.getElementsByClassName('wcContainer')[0];
    expect(wcContainer.classList.contains('ui5-content-density-compact')).toBe(
      true,
    );
  });

  describe('create', () => {
    it('should create a resource successfully', () => {
      component.context = mockNodeContext;
      const mockResource: Resource = {
        metadata: { name: 'new-resource' },
        status: { phase: 'Pending' },
      };
      resourceServiceMock.create.mockReturnValue(
        of({ data: { resource: mockResource } } as any),
      );
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      component.create(mockResource);

      expect(resourceServiceMock.create).toHaveBeenCalledWith(
        mockResource,
        mockResourceDefinition,
      );
      expect(consoleSpy).toHaveBeenCalledWith('Resource created', {
        resource: mockResource,
      });
      consoleSpy.mockRestore();
    });

    it('should show alert when create fails', () => {
      component.context = mockNodeContext;
      const mockResource: Resource = {
        metadata: { name: 'new-resource' },
        status: { phase: 'Pending' },
      };
      const testError = new Error('Create error');
      resourceServiceMock.create.mockReturnValue(throwError(() => testError));

      component.create(mockResource);

      expect(luigiCoreServiceMock.showAlert).toHaveBeenCalledWith({
        text: 'Failure! Could not create resource: new-resource.',
        type: 'error',
      });
    });

    it('should open create resource modal', () => {
      const modalMock = {
        open: jest.fn(),
      };
      jest
        .spyOn(component as any, 'resourceCreateModal')
        .mockReturnValue(modalMock);

      component.openCreateResourceModal();

      expect(modalMock.open).toHaveBeenCalled();
    });
  });

  describe('hasUiCreateViewFields', () => {
    it('should have create fields', () => {
      component.context = mockNodeContext;
      expect(component.hasUiCreateViewFields()).toBe(true);
    });

    it('should not have create fields', () => {
      component.context = mockNodeContext;
      component.resourceDefinition.ui.createView.fields = [];
      expect(component.hasUiCreateViewFields()).toBe(false);
    });
  });
});

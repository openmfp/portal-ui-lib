import {
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../../../models/resource';
import { ResourceService } from '../../../services/resource.service';
import { ListViewComponent } from './list-view.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';
import { Condition } from 'kubernetes-types/meta/v1';
import { of, throwError } from 'rxjs';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let mockResourceService: any;
  let mockLuigiCoreService: any;
  let mockLuigiClient: any;

  const mockResourceDefinition: ResourceDefinition = {
    group: 'test.group',
    plural: 'resources',
    singular: 'resource',
    kind: 'Resource',
    ui: {
      listView: {
        fields: [
          { label: 'Test', property: 'metadata.name' },
          {
            label: 'Status',
            property: 'status.conditions.status',
          },
        ],
      },
      createView: {
        fields: [
          { label: 'Name', property: 'metadata.name', required: true },
          { label: 'Type', property: 'spec.type', required: true },
        ],
      },
      detailView: {
        fields: [],
      },
    },
  };

  const mockContext: NodeContext = {
    resourceDefinition: mockResourceDefinition,
    token: 'test-token',
    parentNavigationContexts: [],
  };

  const mockResources: Resource[] = [
    {
      metadata: { name: 'resource-1' },
      spec: { type: 'type-1' },
      status: { conditions: [{ type: 'Ready', status: 'True' } as Condition] },
    },
    {
      metadata: { name: 'resource-2' },
      spec: { type: 'type-2' },
      status: { conditions: [{ type: 'Ready', status: 'False' } as Condition] },
    },
  ];

  beforeEach(async () => {
    mockResourceService = {
      list: jest.fn().mockReturnValue(of(mockResources)),
      delete: jest.fn().mockReturnValue(of({})),
      create: jest.fn().mockReturnValue(of({ data: {} })),
    };

    mockLuigiCoreService = {
      showAlert: jest.fn(),
    };

    mockLuigiClient = {
      linkManager: jest.fn().mockReturnValue({
        navigate: jest.fn(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ListViewComponent],
      providers: [
        { provide: ResourceService, useValue: mockResourceService },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;
    component.LuigiClient = mockLuigiClient;
    component.context = mockContext;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set columns and heading from context', () => {
    expect(component.columns).toEqual(
      mockResourceDefinition.ui!.listView.fields,
    );
    expect(component.heading).toBe('Resources');
  });

  it('should call read method on initialization', () => {
    const spy = jest.spyOn(component, 'read');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should load resources using resourceService', () => {
    expect(mockResourceService.list).toHaveBeenCalledWith(
      'test_group_resources',
      [{ metadata: ['name'] }, { status: [{ conditions: ['status'] }] }],
    );
    expect(component.resources).toEqual(mockResources);
  });

  it('should delete a resource', () => {
    const event = { stopPropagation: jest.fn() };
    const resource = mockResources[0];

    component.delete(event, resource);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockResourceService.delete).toHaveBeenCalledWith(
      resource,
      mockResourceDefinition,
    );
  });

  it('should show alert on delete error', () => {
    const event = { stopPropagation: jest.fn() };
    const resource = mockResources[0];
    mockResourceService.delete.mockReturnValueOnce(
      throwError(() => new Error('Delete error')),
    );

    component.delete(event, resource);

    expect(mockLuigiCoreService.showAlert).toHaveBeenCalledWith({
      text: `Failure! Could not delete resource: ${resource.metadata.name}.`,
      type: 'error',
    });
  });

  it('should create a resource', () => {
    const resource = mockResources[0];

    component.create(resource);

    expect(mockResourceService.create).toHaveBeenCalledWith(
      resource,
      mockResourceDefinition,
    );
  });

  it('should show alert on create error', () => {
    const resource = mockResources[0];
    mockResourceService.create.mockReturnValueOnce(
      throwError(() => new Error('Create error')),
    );

    component.create(resource);

    expect(mockLuigiCoreService.showAlert).toHaveBeenCalledWith({
      text: `Failure! Could not create resource: ${resource.metadata.name}.`,
      type: 'error',
    });
  });

  it('should navigate to resource detail', () => {
    const resource = mockResources[0];

    component.navigateToResource(resource);

    expect(mockLuigiClient.linkManager).toHaveBeenCalled();
    expect(mockLuigiClient.linkManager().navigate).toHaveBeenCalledWith(
      resource.metadata.name,
    );
  });

  it('should open create resource modal', () => {
    const mockModal = {
      open: jest.fn(),
    };
    (component as any).createModal = jest.fn().mockReturnValue(mockModal);

    component.openCreateResourceModal();

    expect((component as any).createModal).toHaveBeenCalled();
    expect(mockModal.open).toHaveBeenCalled();
  });

  it('should use default columns if no UI listView fields are provided', () => {
    const newContext = { ...mockContext };
    delete newContext.resourceDefinition.ui!.listView.fields;

    component.context = newContext;

    expect(component.columns).toEqual([
      { label: 'Name', property: 'metadata.name' },
      {
        label: 'Workspace Status',
        property: ['status.conditions.status', 'status.conditions.type'],
        jsonPathExpression: 'status.conditions[?(@.type=="Ready")].status',
      },
    ]);
  });

  it('should check if UI create view fields exist', () => {
    expect(component.hasUiCreateViewFields()).toBe(true);

    component.resourceDefinition.ui!.createView!.fields = [];
    expect(component.hasUiCreateViewFields()).toBe(false);

    delete component.resourceDefinition.ui!.createView;
    expect(component.hasUiCreateViewFields()).toBe(false);

    delete component.resourceDefinition.ui;
    expect(component.hasUiCreateViewFields()).toBe(false);
  });
});

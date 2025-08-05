import { ListViewComponent } from './list-view.component';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuigiCoreService, ResourceService } from '@openmfp/portal-ui-lib';
import { of, throwError } from 'rxjs';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let mockResourceService: any;
  let mockLuigiCoreService: any;

  beforeEach(() => {
    mockResourceService = {
      list: jest.fn().mockReturnValue(of([{ metadata: { name: 'test' } }])),
      delete: jest.fn().mockReturnValue(of({})),
      create: jest.fn().mockReturnValue(of({ data: { name: 'test' } })),
    };

    mockLuigiCoreService = {
      showAlert: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ResourceService, useValue: mockResourceService },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      ],
    }).overrideComponent(ListViewComponent, {
      set: { template: '' },
    });

    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;

    component.context = (() => ({
      resourceDefinition: {
        plural: 'clusters',
        kind: 'Cluster',
        group: 'core.k8s.io',
        ui: {
          listView: {
            fields: [],
          },
        },
      },
    })) as any;

    component.LuigiClient = (() => ({
      linkManager: () => ({
        fromContext: jest.fn().mockReturnThis(),
        navigate: jest.fn(),
      }),
    })) as any;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch resources on init', () => {
    expect(mockResourceService.list).toHaveBeenCalled();
    expect(component.resources().length).toBeGreaterThan(0);
  });

  it('should delete a resource', () => {
    const resource = { metadata: { name: 'test' } };
    const event = { stopPropagation: jest.fn() };

    component.delete(event, resource as any);
    expect(mockResourceService.delete).toHaveBeenCalled();
  });

  it('should show alert on delete error', () => {
    mockResourceService.delete.mockReturnValueOnce(
      throwError(() => new Error()),
    );
    const resource = { metadata: { name: 'test' } };
    const event = { stopPropagation: jest.fn() };

    component.delete(event, resource as any);
    expect(mockLuigiCoreService.showAlert).toHaveBeenCalled();
  });

  it('should create a resource', () => {
    const resource = { metadata: { name: 'test' } };

    component.create(resource as any);
    expect(mockResourceService.create).toHaveBeenCalled();
  });

  it('should show alert on create error', () => {
    mockResourceService.create.mockReturnValueOnce(
      throwError(() => new Error()),
    );
    const resource = { metadata: { name: 'test' } };

    component.create(resource as any);
    expect(mockLuigiCoreService.showAlert).toHaveBeenCalled();
  });

  it('should navigate to resource', () => {
    const resource = { metadata: { name: 'res1' } };
    const navSpy = jest.fn();
    component.LuigiClient = (() => ({
      linkManager: () => ({
        navigate: navSpy,
      }),
    })) as any;

    component.navigateToResource(resource as any);
    expect(navSpy).toHaveBeenCalledWith('res1');
  });

  it('should check create view fields existence', () => {
    component.resourceDefinition.ui.createView = {
      fields: [{ property: 'any' }],
    };
    expect(component.hasUiCreateViewFields()).toBe(true);
  });
});

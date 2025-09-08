import { DeleteResourceModalComponent } from './delete-resource-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldDefinition, ResourceNodeContext } from '@openmfp/portal-ui-lib';

describe('DeleteResourceModalComponent', () => {
  let component: DeleteResourceModalComponent;
  let fixture: ComponentFixture<DeleteResourceModalComponent>;
  let mockDialog: any;

  const testFields: FieldDefinition[] = [
    { property: 'name.firstName', required: true, label: 'First Name' },
  ];

  const context: ResourceNodeContext = {
    id: '1',
    path: [],
    entity: { id: 'r1', name: { firstName: 'John' } } as any,
    parent: null as any,
    meta: {} as any,
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteResourceModalComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(DeleteResourceModalComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DeleteResourceModalComponent);
    component = fixture.componentInstance;

    component.fields = (() => testFields) as any;
    component.context = (() => context) as any;

    mockDialog = { open: false };
    (component as any).dialog = () => mockDialog;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog when open method is called', () => {
    component.open();
    expect(mockDialog.open).toBeTruthy();
  });

  it('should close dialog when close method is called', () => {
    mockDialog.open = true;
    component.close();
    expect(mockDialog.open).toBeFalsy();
  });

  it('should emit resource and close when delete is called', () => {
    spyOn(component.resource, 'emit');
    mockDialog.open = true;

    component.delete();

    expect(component.resource.emit).toHaveBeenCalledWith(context.entity as any);
    expect(mockDialog.open).toBeFalsy();
  });
});

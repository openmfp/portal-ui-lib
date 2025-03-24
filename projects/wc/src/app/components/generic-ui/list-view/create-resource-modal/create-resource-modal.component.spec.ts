import { FieldDefinition, Resource } from '../../models/resource';
import { CreateResourceModalComponent } from './create-resource-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateResourceModalComponent', () => {
  let component: CreateResourceModalComponent;
  let fixture: ComponentFixture<CreateResourceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateResourceModalComponent, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateResourceModalComponent);
    component = fixture.componentInstance;

    const mockFields: FieldDefinition[] = [
      { property: 'metadata.name', label: 'Name', required: true },
      {
        property: 'metadata.description',
        label: 'Description',
        required: false,
      },
      { property: 'spec.displayName', label: 'Display Name', required: false },
    ];

    component.fields = (() => mockFields) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with controls based on fields input', () => {
    component.ngOnInit();
    expect(component.form.get('metadata_name')).toBeTruthy();
    expect(component.form.get('metadata_description')).toBeTruthy();
    expect(component.form.get('spec_displayName')).toBeTruthy();
  });

  it('should add validators to required fields', () => {
    component.ngOnInit();
    expect(component.form.get('metadata_name').validator).toBeTruthy();
    expect(component.form.get('metadata_description').validator).toBeNull();
  });

  it('should open dialog when open method is called', () => {
    const mockDialogElement = { nativeElement: { open: false } };
    component.dialog = jest.fn().mockReturnValue(mockDialogElement) as any;

    component.open();

    expect(mockDialogElement.nativeElement.open).toBe(true);
  });

  it('should close dialog and reset form when close method is called', () => {
    const mockDialogElement = { nativeElement: { open: true } };
    component.dialog = jest.fn().mockReturnValue(mockDialogElement) as any;
    jest.spyOn(component.form, 'reset');

    component.close();

    expect(mockDialogElement.nativeElement.open).toBe(false);
    expect(component.form.reset).toHaveBeenCalled();
  });

  it('should emit resource and close dialog when form is valid and create is called', () => {
    const mockDialogElement = { nativeElement: { open: true } };
    component.dialog = jest.fn().mockReturnValue(mockDialogElement) as any;
    component.resource.emit = jest.fn();
    jest.spyOn(component, 'close');

    component.form.setValue({
      metadata_name: 'test-name',
      metadata_description: 'test-description',
      spec_displayName: 'Test Display Name',
    });

    component.create();

    const expectedResource: Resource = {
      metadata: {
        name: 'test-name',
        description: 'test-description',
      },
      spec: {
        displayName: 'Test Display Name',
      },
    };

    expect(component.resource.emit).toHaveBeenCalledWith(expectedResource);
    expect(component.close).toHaveBeenCalled();
  });

  it('should not emit or close when form is invalid and create is called', () => {
    component.resource.emit = jest.fn();
    jest.spyOn(component, 'close');

    component.form.setValue({
      metadata_name: '',
      metadata_description: 'test-description',
      spec_displayName: 'Test Display Name',
    });

    component.create();

    expect(component.resource.emit).not.toHaveBeenCalled();
    expect(component.close).not.toHaveBeenCalled();
  });

  it('should set form control value when setFormControlValue is called', () => {
    const event = { target: { value: 'test-value' } };
    component.setFormControlValue(event, 'metadata_name');

    expect(component.form.get('metadata_name').value).toBe('test-value');
    expect(component.form.get('metadata_name').touched).toBe(true);
    expect(component.form.get('metadata_name').dirty).toBe(true);
  });

  it('should return "Negative" for invalid touched control in getValueState', () => {
    component.form.get('metadata_name').setValue('');
    component.form.get('metadata_name').markAsTouched();

    const state = component.getValueState('metadata_name');

    expect(state).toBe('Negative');
  });

  it('should return "None" for valid control in getValueState', () => {
    component.form.get('metadata_name').setValue('test-name');
    component.form.get('metadata_name').markAsTouched();

    const state = component.getValueState('metadata_name');

    expect(state).toBe('None');
  });

  it('should mark control as touched when onFieldBlur is called', () => {
    component.onFieldBlur('metadata_name');

    expect(component.form.get('metadata_name').touched).toBe(true);
  });
});

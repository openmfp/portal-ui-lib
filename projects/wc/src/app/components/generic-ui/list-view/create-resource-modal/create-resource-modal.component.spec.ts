import { FieldDefinition } from '../../models/resource';
import { CreateResourceModalComponent } from './create-resource-modal.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateResourceModalComponent', () => {
  let component: CreateResourceModalComponent;
  let fixture: ComponentFixture<CreateResourceModalComponent>;
  let mockDialogElement: any;

  const testFields: FieldDefinition[] = [
    { property: 'name.firstName', required: true, label: 'First Name' },
    { property: 'address.city', required: false, label: 'City' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateResourceModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateResourceModalComponent);
    component = fixture.componentInstance;

    component.fields = (() => testFields) as any;

    mockDialogElement = {
      open: false,
    };
    (component as any).dialog = () => ({ nativeElement: mockDialogElement });

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with controls from fields input', () => {
    expect(component.form).toBeDefined();
    expect(component.form.controls['name_firstName']).toBeDefined();
    expect(component.form.controls['address_city']).toBeDefined();

    const firstNameControl = component.form.controls['name_firstName'];
    firstNameControl.setValue('');
    expect(firstNameControl.valid).toBeFalsy();

    const cityControl = component.form.controls['address_city'];
    cityControl.setValue('');
    expect(cityControl.valid).toBeTruthy();
  });

  it('should open dialog when open method is called', () => {
    component.open();
    expect(mockDialogElement.open).toBeTruthy();
  });

  it('should close dialog and reset form when close method is called', () => {
    spyOn(component.form, 'reset');

    component.close();

    expect(mockDialogElement.open).toBeFalsy();
    expect(component.form.reset).toHaveBeenCalled();
  });

  it('should transform form data and emit resource when create method is called with valid form', () => {
    component.form.controls['name_firstName'].setValue('John');
    component.form.controls['address_city'].setValue('New York');

    spyOn(component.resource, 'emit');

    component.create();

    expect(component.resource.emit).toHaveBeenCalledWith({
      name: { firstName: 'John' },
      address: { city: 'New York' },
    });

    expect(mockDialogElement.open).toBeFalsy();
  });

  it('should not emit resource when form is invalid', () => {
    component.form.controls['name_firstName'].setValue('');
    component.form.controls['address_city'].setValue('New York');

    spyOn(component.resource, 'emit');

    component.create();

    expect(component.resource.emit).not.toHaveBeenCalled();
  });

  it('should update form control value, mark as touched and dirty on setFormControlValue', () => {
    const event = { target: { value: 'Test' } };

    spyOn(component.form.controls['name_firstName'], 'setValue');
    spyOn(component.form.controls['name_firstName'], 'markAsTouched');
    spyOn(component.form.controls['name_firstName'], 'markAsDirty');

    component.setFormControlValue(event, 'name_firstName');

    expect(
      component.form.controls['name_firstName'].setValue,
    ).toHaveBeenCalledWith('Test');
    expect(
      component.form.controls['name_firstName'].markAsTouched,
    ).toHaveBeenCalled();
    expect(
      component.form.controls['name_firstName'].markAsDirty,
    ).toHaveBeenCalled();
  });

  it('should return Negative value state for invalid and touched control', () => {
    const control = component.form.controls['name_firstName'];
    control.setValue('');
    control.markAsTouched();

    expect(component.getValueState('name_firstName')).toBe('Negative');
  });

  it('should return None value state for valid control or untouched control', () => {
    const control = component.form.controls['name_firstName'];
    control.setValue('John');
    control.markAsTouched();

    expect(component.getValueState('name_firstName')).toBe('None');

    control.setValue('');
    control.markAsUntouched();

    expect(component.getValueState('name_firstName')).toBe('None');
  });

  it('should mark control as touched on field blur', () => {
    spyOn(component.form.controls['name_firstName'], 'markAsTouched');

    component.onFieldBlur('name_firstName');

    expect(
      component.form.controls['name_firstName'].markAsTouched,
    ).toHaveBeenCalled();
  });

  describe('sanitizePropertyName', () => {
    it('should replace dots with underscores in property name', () => {
      const property = 'metadata.name.firstName';
      const result = (component as any).sanitizePropertyName(property);
      expect(result).toBe('metadata_name_firstName');
    });

    it('should handle property names without dots', () => {
      const property = 'name';
      const result = (component as any).sanitizePropertyName(property);
      expect(result).toBe('name');
    });

    it('should throw error when property is an array', () => {
      const property = ['name', 'firstName'];
      expect(() => (component as any).sanitizePropertyName(property)).toThrow(
        'Wrong property type, array not supported',
      );
    });
  });
});

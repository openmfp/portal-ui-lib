import { DeleteResourceModalComponent } from './delete-resource-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('DeleteResourceModalComponent', () => {
  let component: DeleteResourceModalComponent;
  let fixture: ComponentFixture<DeleteResourceModalComponent>;
  let mockDialog: any;

  const resource: any = { metadata: { name: 'TestName' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(DeleteResourceModalComponent, {
        set: { template: '', imports: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DeleteResourceModalComponent);
    component = fixture.componentInstance;

    mockDialog = { open: false };
    (component as any).dialog = () => mockDialog;

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with "resource" control', () => {
    expect(component.form).toBeDefined();
    expect(component.form.controls['resource']).toBeDefined();
  });

  it('should set dialog open and store innerResource', () => {
    component.open(resource);
    expect(mockDialog.open).toBeTruthy();
    expect(component.innerResource).toBe(resource);
  });

  it('should set dialog closed when closing', () => {
    mockDialog.open = true;
    component.close();
    expect(mockDialog.open).toBeFalsy();
  });

  it('should be invalid when empty or mismatched; valid when matches innerResource.name', () => {
    component.open(resource);
    const control = component.form.controls['resource'];

    control.setValue('');
    control.markAsTouched();
    fixture.detectChanges();
    expect(control.invalid).toBeTruthy();
    expect(control.hasError('invalidResource')).toBeTruthy();

    control.setValue('WrongName');
    fixture.detectChanges();
    expect(control.invalid).toBeTruthy();
    expect(control.hasError('invalidResource')).toBeTruthy();

    control.setValue('TestName');
    fixture.detectChanges();
    expect(control.valid).toBeTruthy();
    expect(control.errors).toBeNull();
  });

  it('should emit the resource and close the dialog when deleting resource', () => {
    component.open(resource);
    spyOn(component.resource, 'emit');
    component.delete();
    expect(component.resource.emit).toHaveBeenCalledWith(resource);
    expect(mockDialog.open).toBeFalsy();
  });

  it('should set value and marks touched/dirty', () => {
    const control = component.form.controls['resource'];
    spyOn(control, 'setValue');
    spyOn(control, 'markAsTouched');
    spyOn(control, 'markAsDirty');

    component.setFormControlValue(
      { target: { value: 'SomeValue' } } as any,
      'resource',
    );

    expect(control.setValue).toHaveBeenCalledWith('SomeValue');
    expect(control.markAsTouched).toHaveBeenCalled();
    expect(control.markAsDirty).toHaveBeenCalled();
  });

  it('should return "Negative" for invalid+touched, else "None"', () => {
    const control = component.form.controls['resource'];

    control.setValue('');
    control.markAsTouched();
    fixture.detectChanges();
    expect(component.getValueState('resource')).toBe('Negative');

    component.open(resource);
    control.setValue('TestName');
    fixture.detectChanges();
    expect(component.getValueState('resource')).toBe('None');

    control.setValue('');
    control.markAsUntouched();
    fixture.detectChanges();
    expect(component.getValueState('resource')).toBe('None');
  });

  it('should mark the control as touched', () => {
    const control = component.form.controls['resource'];
    spyOn(control, 'markAsTouched');
    component.onFieldBlur('resource');
    expect(control.markAsTouched).toHaveBeenCalled();
  });
});

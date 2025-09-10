import { DeleteResourceModalComponent } from './delete-resource-modal.component';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

jest.mock('@ui5/webcomponents-ngx', () => ({}), { virtual: true });

describe('DeleteResourceModalComponent', () => {
  let component: DeleteResourceModalComponent;
  let fixture: ComponentFixture<DeleteResourceModalComponent>;
  let mockDialog: any;

  const resource: any = { metadata: { name: 'TestName' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(DeleteResourceModalComponent, {
        set: {
          imports: [CommonModule, ReactiveFormsModule],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
        },
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

  it('should render title with resource name in lowercase in the header', () => {
    component.open(resource);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('ui5-title');
    expect(title?.textContent?.toLowerCase()).toContain('delete testname');
  });

  it('should render prompt text with resource name and cannot be undone note', () => {
    component.open(resource);
    (component as any).context = () => ({
      resourceDefinition: { singular: 'resource' },
    });
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('section.content');
    const text = content?.textContent?.toLowerCase() || '';
    expect(text).toContain('are you sure you want to delete');
    expect(text).toContain('testname');
    expect(text).toContain('cannot');
  });

  it('should bind input value to form control and show Negative valueState when invalid and touched', () => {
    component.open(resource);
    fixture.detectChanges();

    const inputEl: HTMLElement & {
      value?: string;
      valueState?: string;
      dispatchEvent?: any;
    } = fixture.nativeElement.querySelector('ui5-input');
    expect(inputEl).toBeTruthy();

    component.setFormControlValue(
      { target: { value: 'wrong' } } as any,
      'resource',
    );
    component.onFieldBlur('resource');
    fixture.detectChanges();

    expect(component.form.controls['resource'].invalid).toBeTruthy();
    expect(component.getValueState('resource')).toBe('Negative');
  });

  it('should close dialog when Cancel button clicked', () => {
    component.open(resource);
    mockDialog.open = true;
    fixture.detectChanges();

    const cancelBtn: HTMLElement = fixture.nativeElement.querySelector(
      'ui5-toolbar-button[design="Transparent"]',
    );
    expect(cancelBtn).toBeTruthy();

    cancelBtn.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(mockDialog.open).toBeFalsy();
  });
});

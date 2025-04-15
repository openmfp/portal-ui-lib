import { FieldDefinition, Resource } from '../../models/resource';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { set } from 'lodash';

@Component({
  selector: 'create-resource-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-resource-modal.component.html',
  styleUrl: './create-resource-modal.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CreateResourceModalComponent implements OnInit {
  fields = input<FieldDefinition[]>([]);
  resource = output<Resource>();
  dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  fb = inject(FormBuilder);
  form: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group(this.createControls());
  }

  open() {
    this.dialog().nativeElement['open'] = true;
  }

  close() {
    this.dialog().nativeElement['open'] = false;
    this.form.reset();
  }

  create() {
    if (this.form.valid) {
      const result = {} as Resource;
      for (const key in this.form.value) {
        set(result, key.replaceAll('_', '.'), this.form.value[key]);
      }

      this.resource.emit(result);
      this.close();
    }
  }

  private createControls() {
    return this.fields().reduce((obj, fieldDefinition) => {
      const validator = fieldDefinition.required ? Validators.required : null;
      obj[this.sanitizePropertyName(fieldDefinition.property)] =
        new FormControl('', validator);
      return obj;
    }, {});
  }

  setFormControlValue($event: any, formControlName: string) {
    this.form.controls[formControlName].setValue($event.target.value);
    this.form.controls[formControlName].markAsTouched();
    this.form.controls[formControlName].markAsDirty();
  }

  getValueState(formControlName: string) {
    const control = this.form.controls[formControlName];
    return control.invalid && control.touched ? 'Negative' : 'None';
  }

  onFieldBlur(formControlName: string) {
    this.form.controls[formControlName].markAsTouched();
  }

  sanitizePropertyName(property: string | string[]) {
    if (property instanceof Array) {
      throw new Error('Wrong property type, array not supported');
    }
    return (property as string).replaceAll('.', '_');
  }
}

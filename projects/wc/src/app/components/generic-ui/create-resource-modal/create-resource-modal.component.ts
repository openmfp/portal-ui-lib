import { ColumnDefinition, Resource } from '../models/resource';
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
  columns = input<ColumnDefinition[]>([]);
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
      this.resource.emit(this.form.value);
      this.close();
    }
  }

  private createControls() {
    return this.columns().reduce((o, c) => {
      o[c.property] =
        c.property === 'metadata.name'
          ? new FormControl('', Validators.required)
          : new FormControl('');
      return o;
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
}

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Resource, ResourceNodeContext } from '@openmfp/portal-ui-lib';
import {
  BarComponent,
  DialogComponent,
  IconComponent,
  InputComponent,
  TextComponent,
  TitleComponent,
  ToolbarButtonComponent,
  ToolbarComponent,
} from '@ui5/webcomponents-ngx';

@Component({
  selector: 'delete-resource-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogComponent,
    TitleComponent,
    ToolbarButtonComponent,
    ToolbarComponent,
    InputComponent,
    BarComponent,
    IconComponent,
    TextComponent,
  ],
  templateUrl: './delete-resource-modal.component.html',
  styleUrl: './delete-resource-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteResourceModalComponent implements OnInit {
  context = input<ResourceNodeContext>();
  dialog = viewChild<DialogComponent>('dialog');
  innerResource = signal<Resource | null>(null);

  resource = output<Resource>();

  fb = inject(FormBuilder);
  form: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group(this.createControls());
    this.form.controls.resource.valueChanges.subscribe((value) => {
      if (!value || this.innerResource()?.metadata?.name !== value) {
        this.form.controls.resource.setErrors({ invalidResource: true });
      } else {
        this.form.controls.resource.setErrors(null);
      }
    });
  }

  open(resource: Resource): void {
    const dialog = this.dialog();
    if (dialog) {
      dialog.open = true;
      this.innerResource.set(resource);
    }
  }

  close(): void {
    const dialog = this.dialog();
    if (dialog) {
      this.form.controls.resource.setValue(null);
      dialog.open = false;
    }
  }

  delete(): void {
    const res = this.innerResource();
    if (res) {
      this.resource.emit(res);
    }
    this.close();
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

  private createControls() {
    return {
      resource: new FormControl(null, Validators.required),
    };
  }
}

import {
  Component,
  ViewEncapsulation,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  FieldDefinition,
  Resource,
  ResourceNodeContext,
} from '@openmfp/portal-ui-lib';
import {
  DialogComponent,
  ToolbarButtonComponent,
  ToolbarComponent,
} from '@ui5/webcomponents-ngx';

@Component({
  selector: 'delete-resource-modal',
  standalone: true,
  imports: [DialogComponent, ToolbarButtonComponent, ToolbarComponent],
  templateUrl: './delete-resource-modal.component.html',
  styleUrl: './delete-resource-modal.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DeleteResourceModalComponent {
  fields = input<FieldDefinition[]>([]);
  context = input<ResourceNodeContext>();
  resource = output<Resource>();
  dialog = viewChild<DialogComponent>('dialog');

  open(): void {
    const dialog = this.dialog();
    if (dialog) {
      dialog.open = true;
    }
  }

  close(): void {
    const dialog = this.dialog();
    if (dialog) {
      dialog.open = false;
    }
  }

  delete(): void {
    this.close();
  }
}

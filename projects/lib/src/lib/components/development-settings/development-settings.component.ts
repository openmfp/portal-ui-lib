import { Component } from '@angular/core';
import {
  ButtonComponent,
  ContentDensityDirective,
  FormControlComponent,
  FormItemComponent,
  FormLabelComponent,
  IconComponent,
  ListBylineDirective,
  ListComponent,
  ListContentDirective,
  ListItemComponent,
  ListSecondaryDirective,
  ListThumbnailDirective,
  ListTitleDirective,
} from '@fundamental-ngx/core';

@Component({
  selector: 'development-settings',
  standalone: true,
  templateUrl: './development-settings.component.html',
  styleUrl: './development-settings.component.css',
  imports: [
    ListComponent,
    IconComponent,
    ButtonComponent,
    ListItemComponent,
    ListThumbnailDirective,
    ListContentDirective,
    ListTitleDirective,
    ListBylineDirective,
    FormLabelComponent,
    FormItemComponent,
    FormControlComponent,
    ContentDensityDirective,
    ListSecondaryDirective,
  ],
})
export class DevelopmentSettingsComponent {
  displayedItems = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Strawberry'];

  removeItem(index: number): void {
    // const allValuesIndex = this.items.indexOf(this.displayedItems[index]);
    // this.items.splice(allValuesIndex, 1);
    // this.displayedItems.splice(index, 1);
  }
}

import { Component, ViewEncapsulation } from '@angular/core';
import {
  ButtonComponent,
  ContentDensityDirective,
  FormControlComponent,
  FormItemComponent,
  FormLabelComponent,
  ListComponent,
  ListItemComponent,
  ListSecondaryDirective,
  ListTitleDirective,
  SwitchComponent,
} from '@fundamental-ngx/core';

@Component({
  selector: 'development-settings',
  standalone: true,
  templateUrl: './development-settings.component.html',
  styleUrl: './development-settings.component.css',
  imports: [
    ListComponent,
    ButtonComponent,
    ListItemComponent,
    ListTitleDirective,
    FormLabelComponent,
    FormItemComponent,
    FormControlComponent,
    ContentDensityDirective,
    ListSecondaryDirective,
    SwitchComponent,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DevelopmentSettingsComponent {
  // private i = UserSettingsLocalStorage;

  displayedItems = [
    'https://organization-dev.dfabj.sites.dxp.k8s.ondemand.com/cc.json',
    'https://organization-dev.dfabj.sites.dxp.k8s.ondemand.com/content-configuration.json',
    'http://localhost:4200/content-configuration.json',
  ];

  displayedItems2 = [
    'key1: value1',
    'key2: value2',
    'key3: value3',
    'key4: value4',
    'key5: value5',
  ];
  isActive: boolean;

  removeItem(index: number): void {
    // const allValuesIndex = this.items.indexOf(this.displayedItems[index]);
    // this.items.splice(allValuesIndex, 1);
    // this.displayedItems.splice(index, 1);
  }
}

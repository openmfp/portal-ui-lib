import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import {
  LocalDevelopmentSettingsLocalStorage,
  LocalStorageKeys,
} from '../../services';
import { LocalDevelopmentSettings } from '../../models';
import { sendCustomMessage } from '@luigi-project/client';

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
    FormsModule,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DevelopmentSettingsComponent implements OnInit {
  protected errors = [];
  protected readonly Object = Object;
  protected localDevelopmentSettings: LocalDevelopmentSettings = {
    isActive: false,
    configs: [],
    serviceProviderConfig: {},
  };

  ngOnInit(): void {
    this.localDevelopmentSettings =
      LocalDevelopmentSettingsLocalStorage.read(
        LocalStorageKeys.DEVELOPMENT_MODE_CONFIG
      ) ||
      LocalDevelopmentSettingsLocalStorage.read() ||
      this.localDevelopmentSettings;
  }

  private saveDevelopmentSettings() {
    sendCustomMessage({
      id: 'luigi.updateUserSettings',
      data: { localDevelopmentSettings: this.localDevelopmentSettings },
    });
  }

  protected addUrl(url: string) {
    if (!this.isValidUrl(url)) {
      this.errors.push('pattern');
    } else if (
      url &&
      !this.localDevelopmentSettings.configs.find((e) => e.url === url)
    ) {
      this.errors.length = 0;
      this.localDevelopmentSettings.configs.push({ url });
      this.saveDevelopmentSettings();
    }
  }

  protected removeUrl(index: number) {
    this.localDevelopmentSettings.configs.splice(index, 1);
    this.saveDevelopmentSettings();
  }

  protected removeServiceProviderConfig(key: string) {
    delete this.localDevelopmentSettings.serviceProviderConfig[key];
    this.saveDevelopmentSettings();
  }

  protected addServiceProviderConfig(key: string, value: string) {
    if (key && value) {
      this.localDevelopmentSettings.serviceProviderConfig[key] = value;
      this.saveDevelopmentSettings();
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  switchIsActive() {
    this.localDevelopmentSettings.isActive =
      !this.localDevelopmentSettings.isActive;
    this.saveDevelopmentSettings();
  }
}

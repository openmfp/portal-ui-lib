import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  ContentDensityDirective,
  FormControlComponent,
  FormItemComponent,
  FormLabelComponent,
  LinkComponent,
  ListComponent,
  ListItemComponent,
  ListSecondaryDirective,
  ListTitleDirective,
  SwitchComponent,
} from '@fundamental-ngx/core';
import {
  I18nService,
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
    LinkComponent,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DevelopmentSettingsComponent implements OnInit {
  private i18nService = inject(I18nService);
  protected texts = this.readTranslations();

  protected errors = [];
  protected readonly Object = Object;
  protected localDevelopmentSettings: LocalDevelopmentSettings = {
    isActive: false,
    configs: [],
    serviceProviderConfig: {},
  };

  ngOnInit(): void {
    this.readTranslations();

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

  protected switchIsActive() {
    this.localDevelopmentSettings.isActive =
      !this.localDevelopmentSettings.isActive;
    this.saveDevelopmentSettings();
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  private readTranslations() {
    return {
      explanation: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_EXPLANATION'
      ),
      link: this.i18nService.getTranslation('LOCAL_DEVELOPMENT_SETTINGS_LINK'),
      addButton: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_ADD_BUTTON'
      ),
      clearButton: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_CLEAR_BUTTON'
      ),
      removeButton: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_REMOVE_BUTTON'
      ),
      isDevelopmentModeActive: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_IS_ACTIVE'
      ),
      urlsInput: {
        title: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_URLS_TITLE'
        ),
        label: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_URLS_LABEL'
        ),
        error: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_URLS_ERROR'
        ),
      },
      serviceProviderConfig: {
        title: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_TITLE'
        ),
        explanation: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_EXPLANATION'
        ),
        keyInput: {
          label: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_LABEL'
          ),
          placeholder: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_PLACEHOLDER'
          ),
        },
        valueInput: {
          label: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_LABEL'
          ),
          placeholder: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_PLACEHOLDER'
          ),
        },
      },
    };
  }
}

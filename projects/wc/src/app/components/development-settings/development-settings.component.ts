import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
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
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  Config,
  I18nService,
  LocalStorageKeys,
  localDevelopmentSettingsLocalStorage,
} from '@openmfp/portal-ui-lib';

@Component({
  selector: 'development-settings',
  standalone: true,
  templateUrl: './development-settings.component.html',
  styleUrl: './development-settings.component.scss',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevelopmentSettingsComponent implements OnInit {
  private i18nService = inject(I18nService);

  public context = input.required<any>();
  public LuigiClient = input.required<LuigiClient>();

  protected texts = computed(() => this.readTranslations());
  protected errors = signal<string[]>([]);
  protected readonly Object = Object;
  protected readonly defaultConfig = [
    {
      url: 'http://localhost:4200/assets/content-configuration-global.json',
    },
    {
      url: 'http://localhost:4200/assets/content-configuration.json',
    },
  ];
  public isActive = signal<boolean>(false);
  public configs = signal<Config[]>(this.defaultConfig);
  public serviceProviderConfig = signal<Record<string, string>>({});

  protected localDevelopmentSettings = computed(() => ({
    isActive: this.isActive(),
    configs: this.configs(),
    serviceProviderConfig: this.serviceProviderConfig(),
  }));

  ngOnInit(): void {
    const localDevelopmentSettings =
      localDevelopmentSettingsLocalStorage.read(
        LocalStorageKeys.DEVELOPMENT_MODE_CONFIG,
      ) ||
      localDevelopmentSettingsLocalStorage.read() ||
      this.localDevelopmentSettings();

    this.isActive.set(localDevelopmentSettings.isActive);
    this.configs.set(localDevelopmentSettings.configs || []);
    this.serviceProviderConfig.set(
      localDevelopmentSettings.serviceProviderConfig || {},
    );
  }

  private saveDevelopmentSettings() {
    this.LuigiClient().publishEvent(
      new CustomEvent('luigi.updateUserSettings', {
        detail: {
          localDevelopmentSettings: this.localDevelopmentSettings(),
        },
      }),
    );
  }

  addUrl(url: string) {
    if (!this.isValidUrl(url)) {
      this.errors.set([...this.errors(), 'pattern']);
    } else if (url && !this.configs().find((e) => e.url === url)) {
      this.errors.set([]);
      this.configs.update((configs) => [...configs, { url }]);
      this.saveDevelopmentSettings();
    }
  }

  removeUrl(index: number) {
    this.configs.update((configs) => configs.filter((_, i) => i !== index));
    this.saveDevelopmentSettings();
  }

  removeServiceProviderConfig(key: string) {
    this.serviceProviderConfig.update((config) => {
      delete config[key];
      return { ...config };
    });
    this.saveDevelopmentSettings();
  }

  addServiceProviderConfig(key: string, value: string) {
    if (key && value) {
      this.serviceProviderConfig.update((config) => {
        config[key] = value;
        return { ...config };
      });
      this.saveDevelopmentSettings();
    }
  }

  switchIsActive() {
    this.isActive.update((isActive) => !isActive);
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
    this.i18nService.translationTable = this.context().translationTable;
    return {
      explanation: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_EXPLANATION',
      ),
      link: this.i18nService.getTranslation('LOCAL_DEVELOPMENT_SETTINGS_LINK'),
      addButton: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_ADD_BUTTON',
      ),
      clearButton: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_CLEAR_BUTTON',
      ),
      removeButton: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_REMOVE_BUTTON',
      ),
      isDevelopmentModeActive: this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_IS_ACTIVE',
      ),
      urlsInput: {
        title: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_URLS_TITLE',
        ),
        label: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_URLS_LABEL',
        ),
        error: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_URLS_ERROR',
        ),
      },
      serviceProviderConfig: {
        title: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_TITLE',
        ),
        explanation: this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_EXPLANATION',
        ),
        keyInput: {
          label: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_LABEL',
          ),
          placeholder: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_PLACEHOLDER',
          ),
        },
        valueInput: {
          label: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_LABEL',
          ),
          placeholder: this.i18nService.getTranslation(
            'LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_PLACEHOLDER',
          ),
        },
      },
    };
  }
}

import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { I18nService, featureToggleLocalStorage } from '@openmfp/portal-ui-lib';
import { ButtonComponent, InputComponent, LabelComponent, LinkComponent, ListComponent, ListItemCustomComponent, SwitchComponent } from '@ui5/webcomponents-ngx';


@Component({
  selector: 'wc-feature-toggle',
  imports: [
    SwitchComponent,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    LabelComponent,
    KeyValuePipe,
    ListComponent,
    ListItemCustomComponent,
    LinkComponent,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './feature-toggle.component.html',
  styleUrl: './feature-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureToggleComponent {
  private i18nService = inject(I18nService);

  public context = input<any>();
  public LuigiClient = input<LuigiClient>();
  public togglesForm = new FormGroup({});
  public newToggleControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public queryParamsFeatures = this.extractFeatureToggleValues(
    window.location.search,
  );
  public translationTable = computed(() => this.context().translationTable);

  protected texts: any = {};

  constructor() {
    this.togglesForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.saveFeatureToggleSettings();
    });

    effect(() => {
      this.i18nService.translationTable = this.translationTable();
      this.texts = this.readTranslations();
    });
  }

  ngOnInit(): void {
    const featureToggleSettings = featureToggleLocalStorage.read();
    this.LuigiClient()
      .getActiveFeatureToggles()
      .forEach((ft: string) => {
        if (!featureToggleSettings[ft]) {
          featureToggleSettings[ft] = true;
        }
      });

    Object.entries(featureToggleSettings).forEach(([key, value]) => {
      this.togglesForm.addControl(key, new FormControl(value), {
        emitEvent: false,
      });

      if (this.queryParamsFeatures.includes(key)) {
        this.togglesForm.get(key)!.disable({ emitEvent: false });
      }
    });

    featureToggleLocalStorage.store(featureToggleSettings);
  }

  addToggle() {
    if (this.togglesForm.get(this.newToggleControl.value)) {
      return;
    }

    this.togglesForm.addControl(
      this.newToggleControl.value,
      new FormControl(false),
    );
    this.newToggleControl.reset();
  }

  clear() {
    this.newToggleControl.reset();
  }

  onItemDelete(featureToggle: string) {
    this.togglesForm.removeControl(featureToggle);
  }

  private extractFeatureToggleValues(queryString: string): string[] {
    if (!queryString) {
      return [];
    }

    const urlParams = new URLSearchParams(queryString);
    const allFtValues = urlParams
      .getAll('ft')
      .flatMap((value) => value.split(','));

    return allFtValues;
  }

  private saveFeatureToggleSettings() {
    this.LuigiClient().publishEvent(
      new CustomEvent('luigi.updateUserSettings', {
        detail: {
          featureToggleSettings: this.togglesForm.getRawValue(),
        },
      }),
    );
  }

  private readTranslations() {
    return {
      explanation: this.i18nService.getTranslation(
        'FEATURE_TOGGLE_SETTINGS_EXPLANATION',
      ),
      link: this.i18nService.getTranslation('FEATURE_TOGGLE_SETTINGS_LINK'),
      addButton: this.i18nService.getTranslation(
        'FEATURE_TOGGLE_SETTINGS_ADD_BUTTON',
      ),
      clearButton: this.i18nService.getTranslation(
        'FEATURE_TOGGLE_SETTINGS_CLEAR_BUTTON',
      ),
      nameInputLabel: this.i18nService.getTranslation(
        'FEATURE_TOGGLE_SETTINGS_NAME_INPUT_LABEL',
      ),
    };
  }
}

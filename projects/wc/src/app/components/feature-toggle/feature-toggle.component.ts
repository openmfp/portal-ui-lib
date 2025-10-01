import { KeyValuePipe } from '@angular/common';
import { Component, ViewEncapsulation, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { featureToggleLocalStorage } from '@openmfp/portal-ui-lib';
import {
  ButtonComponent,
  InputComponent,
  LabelComponent,
  LinkComponent,
  ListComponent,
  ListItemCustomComponent,
  SwitchComponent,
} from '@ui5/webcomponents-ngx';

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
})
export class FeatureToggleComponent {
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

  constructor() {
    this.togglesForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.saveFeatureToggleSettings();
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
    console.log('allFtValues', allFtValues);

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
}

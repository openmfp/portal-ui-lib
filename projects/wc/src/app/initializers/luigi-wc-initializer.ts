import { DevelopmentSettingsComponent } from '../components/development-settings/development-settings.component';
import { FeatureToggleComponent } from '../components/feature-toggle/feature-toggle.component';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import { registerLuigiWebComponents } from '../utils/wc';
import { Injector, inject, provideAppInitializer } from '@angular/core';

function initializeWC() {
  const injector = inject(Injector);
  registerLuigiWebComponents(
    {
      'development-settings': DevelopmentSettingsComponent,
      'getting-started': GettingStartedComponent,
      'feature-toggle': FeatureToggleComponent,
    },
    injector,
  );
}

export const provideLuigiWebComponents = () =>
  provideAppInitializer(initializeWC);

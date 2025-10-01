import { DevelopmentSettingsComponent } from '../components/development-settings/development-settings.component';
import { ErrorComponent } from '../components/error/error.component';
import { FeatureToggleComponent } from '../components/feature-toggle/feature-toggle.component';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import { registerLuigiWebComponents } from '../utils/wc';
import { APP_INITIALIZER, Injector, inject } from '@angular/core';

function initializeWC() {
  const injector = inject(Injector);
  registerLuigiWebComponents(
    {
      'error-component': ErrorComponent,
      'development-settings': DevelopmentSettingsComponent,
      'getting-started': GettingStartedComponent,
      'feature-toggle': FeatureToggleComponent,
    },
    injector,
  );

  return () => undefined;
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeWC,
  multi: true,
};

export const provideLuigiWebComponents = () => provider;

import { APP_INITIALIZER, inject, Injector } from '@angular/core';
import { ErrorComponent } from '../components/error/error.component';
import { registerLuigiWebComponents } from '../utils/wc';

function initializeWC() {
  const injector = inject(Injector);
  registerLuigiWebComponents(
    {
      'error-component': ErrorComponent,
    },
    injector
  );

  return () => undefined;
}

const provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeWC,
  multi: true,
};

export const provideLuigiWebComponents = () => provider;

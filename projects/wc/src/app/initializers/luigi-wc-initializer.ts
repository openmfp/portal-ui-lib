import { ErrorComponent } from '../components/error/error.component';
import { DetailViewComponent } from '../components/generic-ui/detail-view/detail-view.component';
import { ListViewComponent } from '../components/generic-ui/list-view/list-view.component';
import { registerLuigiWebComponents } from '../utils/wc';
import { APP_INITIALIZER, Injector, inject } from '@angular/core';

function initializeWC() {
  const injector = inject(Injector);
  registerLuigiWebComponents(
    {
      'error-component': ErrorComponent,
      'generic-list-view': ListViewComponent,
      'generic-detail-view': DetailViewComponent,
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

import { ErrorComponent } from '../components/error/error.component';
import { DetailViewComponent } from '../components/generic-ui/detail-view/detail-view.component';
import { ListViewComponent } from '../components/generic-ui/list-view/list-view.component';
import { registerLuigiWebComponents } from '../utils/wc';
import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

export function provideLuigiWebComponents(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        return () => {
          registerLuigiWebComponents(
            {
              'error-component': ErrorComponent,
              'generic-list-view': ListViewComponent,
              'generic-detail-view': DetailViewComponent,
            },
            inject(Injector),
          );
        };
      },
      multi: true,
    },
  ]);
}

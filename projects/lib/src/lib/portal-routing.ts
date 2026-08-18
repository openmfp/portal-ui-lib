import { ErrorScreenComponent, LogoutComponent, LuigiComponent } from './components';
import { Routes } from '@angular/router';

export const portalRouts: Routes = [
  { path: 'logout', component: LogoutComponent },
  {
    path: 'error/not-found',
    component: ErrorScreenComponent,
    data: {
      icon: 'sap-icon--search',
      titleKey: 'ERROR_NOT_FOUND_TITLE',
      subtitleKey: 'ERROR_NOT_FOUND_SUBTITLE',
    },
  },
  {
    path: 'error/not-authorized',
    component: ErrorScreenComponent,
    data: {
      icon: 'sap-icon--locked',
      titleKey: 'ERROR_NOT_AUTHORIZED_TITLE',
      subtitleKey: 'ERROR_NOT_AUTHORIZED_SUBTITLE',
    },
  },
  {
    path: 'error/unexpected',
    component: ErrorScreenComponent,
    data: {
      icon: 'sap-icon--alert',
      titleKey: 'ERROR_UNEXPECTED_TITLE',
      subtitleKey: 'ERROR_UNEXPECTED_SUBTITLE',
      expandedByDefault: true,
    },
  },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

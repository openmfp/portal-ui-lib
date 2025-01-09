import { Routes } from '@angular/router';
import {
  LogoutComponent,
  LuigiComponent,
  CallbackComponent,
  DevelopmentSettingsComponent,
} from './components';

export const portalRouts: Routes = [
  { path: 'callback', component: CallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'development-settings', component: DevelopmentSettingsComponent },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

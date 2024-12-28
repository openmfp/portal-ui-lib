import { Routes } from '@angular/router';
import {
  LogoutComponent,
  LuigiComponent,
  CallbackComponent,
} from './components';

export const portalRouts: Routes = [
  { path: 'callback', component: CallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

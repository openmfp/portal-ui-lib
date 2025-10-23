import { LogoutComponent, LuigiComponent } from './components';
import { Routes } from '@angular/router';

export const portalRouts: Routes = [
  { path: 'logout', component: LogoutComponent },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogoutComponent } from './components/logout/logout.component';
import { LuigiComponent } from './components/luigi/luigi.component';
import { CallbackComponent } from './components/callback/callback.component';

export const portalRouts: Routes = [
  { path: 'callback', component: CallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(portalRouts)],
  exports: [RouterModule],
})
export class PortalRoutingModule {
  constructor() {}
}

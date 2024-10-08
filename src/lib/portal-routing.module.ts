import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import {
  LogoutComponent,
  LuigiComponent,
  CallbackComponent,
} from './components';
import { ErrorComponent } from './components/error/error.component';
import { CustomReuseStrategy } from './utilities';

const portalRouts: Routes = [
  { path: 'error-handling', component: ErrorComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(portalRouts)],
  providers: [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  exports: [RouterModule],
})
export class PortalRoutingModule {
  constructor() {}
}

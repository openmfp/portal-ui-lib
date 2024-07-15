import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';

export const portalRouts: Routes = [
  { path: 'callback2', component: CallbackComponent },
];

@NgModule({
  imports: [RouterModule.forChild(portalRouts)],
  exports: [RouterModule],
})
export class PortalRoutingModule {
  constructor() {}
}

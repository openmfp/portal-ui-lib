import { NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { PortalRoutingModule } from './portal-routing.module';
import { PortalComponent } from './portal.component';

@NgModule({
  declarations: [PortalComponent, CallbackComponent],
  imports: [PortalRoutingModule, RouterOutlet],
  bootstrap: [PortalComponent],
})
export class PortalModule {}

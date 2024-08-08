import { NgModule, Type } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import {
  LOCAL_NODES_SERVICE_INJECTION_TOKEN,
  LUIGI_COMMUNICATION_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from './injection-tokens';
import { LogoutComponent } from './logout/logout.component';
import { LuigiComponent } from './luigi/luigi.component';
import { CallbackComponent } from './callback/callback.component';
import { PortalRoutingModule } from './portal-routing.module';
import { PortalComponent } from './portal.component';
import {
  StaticSettingsConfigService,
  StaticSettingsConfigServiceImpl,
  CommunicationConfigService,
  CommunicationConfigServiceImpl,
  LocalNodesService,
  NoopLocalNodesService,
} from './services';

export interface PortalModuleOptions {
  /** Service containing and providing the luigi settings configuration **/
  staticSettingsConfigService?: Type<StaticSettingsConfigService>;

  /** Service containing and providing the luigi communication configuration **/
  communicationConfigService?: Type<CommunicationConfigService>;

  /** Service containing and providing the luigi communication configuration **/
  localNodesService?: Type<LocalNodesService>;
}

@NgModule({
  declarations: [
    LuigiComponent,
    PortalComponent,
    CallbackComponent,
    LogoutComponent,
  ],
  providers: [
    {
      provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: StaticSettingsConfigServiceImpl,
    },
    {
      provide: LUIGI_COMMUNICATION_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: CommunicationConfigServiceImpl,
    },
    {
      provide: LOCAL_NODES_SERVICE_INJECTION_TOKEN,
      useClass: NoopLocalNodesService,
    },
  ],
  imports: [PortalRoutingModule, BrowserModule, RouterOutlet, HttpClientModule],
  exports: [PortalComponent],
  bootstrap: [PortalComponent],
})
export class PortalModule {
  static create(options: PortalModuleOptions): NgModule {
    return {
      declarations: [
        LuigiComponent,
        PortalComponent,
        CallbackComponent,
        LogoutComponent,
      ],
      providers: [
        {
          provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.staticSettingsConfigService ||
            StaticSettingsConfigServiceImpl,
        },
        {
          provide: LUIGI_COMMUNICATION_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.communicationConfigService ||
            CommunicationConfigServiceImpl,
        },
        {
          provide: LOCAL_NODES_SERVICE_INJECTION_TOKEN,
          useClass: options.localNodesService || NoopLocalNodesService,
        },
      ],
      imports: [
        PortalRoutingModule,
        BrowserModule,
        RouterOutlet,
        HttpClientModule,
      ],
      exports: [PortalComponent],
      bootstrap: [PortalComponent],
    };
  }
}

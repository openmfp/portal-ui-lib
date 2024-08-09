import { NgModule, Type } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import {
  LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from './injection-tokens';
import { LogoutComponent } from './logout/logout.component';
import { LuigiComponent } from './luigi/luigi.component';
import { CallbackComponent } from './callback/callback.component';
import { PortalRoutingModule } from './portal-routing.module';
import { PortalComponent } from './portal.component';
import {
  CustomMessageListener,
  StaticSettingsConfigService,
  StaticSettingsConfigServiceImpl,
} from './services';

export interface PortalModuleOptions {
  /** Service containing and providing the luigi settings configuration **/
  staticSettingsConfigService?: Type<StaticSettingsConfigService>;

  /** A set of class representing custom listeners **/
  customMessageListeners?: Type<CustomMessageListener>[];
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
  ],
  imports: [PortalRoutingModule, BrowserModule, RouterOutlet, HttpClientModule],
  exports: [PortalComponent],
  bootstrap: [PortalComponent],
})
export class PortalModule {
  static create(options: PortalModuleOptions): NgModule {
    const customMessageListeners = (options.customMessageListeners || []).map(
      (customMessageListenerClass) => ({
        provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
        multi: true,
        useClass: customMessageListenerClass,
      })
    );

    return {
      declarations: [
        LuigiComponent,
        PortalComponent,
        CallbackComponent,
        LogoutComponent,
      ],
      providers: [
        ...customMessageListeners,
        {
          provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.staticSettingsConfigService ||
            StaticSettingsConfigServiceImpl,
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

import { NgModule, Type } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import {
  LOCAL_NODES_SERVICE_INJECTION_TOKEN,
  LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
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
  LocalNodesService,
  NoopLocalNodesService,
} from './services';
import {
  NoopUserSettingsConfigService,
  UserSettingsConfigService,
} from './services/luigi-config/user-settings-config.service';
import {
  GlobalSearchConfigService,
  NoopGlobalSearchConfigService,
} from './services/luigi-config/global-search-config.service';

export interface PortalModuleOptions {
  /** Service containing and providing the luigi settings configuration **/
  staticSettingsConfigService?: Type<StaticSettingsConfigService>;

  /** A set of class representing custom listeners **/
  customMessageListeners?: Type<CustomMessageListener>[];

  /** Service providing local nodes merging services **/
  localNodesService?: Type<LocalNodesService>;

  /** Service providing user setting specific configuration **/
  userSettingsConfigService: Type<UserSettingsConfigService>;

  /** Service providing global search configuration **/
  globalSearchConfigService: Type<GlobalSearchConfigService>;
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
      provide: LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: NoopUserSettingsConfigService,
    },
    {
      provide: LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: NoopGlobalSearchConfigService,
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
        {
          provide: LOCAL_NODES_SERVICE_INJECTION_TOKEN,
          useClass: options.localNodesService || NoopLocalNodesService,
        },
        {
          provide: LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.userSettingsConfigService || NoopUserSettingsConfigService,
        },
        {
          provide: LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.globalSearchConfigService || NoopGlobalSearchConfigService,
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

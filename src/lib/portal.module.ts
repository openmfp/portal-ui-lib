import { Inject, NgModule, Type } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import {
  LOCAL_NODES_SERVICE_INJECTION_TOKEN,
  LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from './injection-tokens';
import {
  LogoutComponent,
  LuigiComponent,
  CallbackComponent,
} from './components';
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
  AppSwitcherConfigService,
  NoopAppSwitcherConfigService,
} from './services/luigi-config/app-switcher-config.service';
import {
  LuigiBreadcrumbConfigService,
  NoopLuigiBreadcrumbConfigService,
} from './services/luigi-config/luigi-breadcrumb-config.service';
import {
  NavigationGlobalContextConfigService,
  NavigationGlobalContextConfigServiceImpl,
} from './services/luigi-config/navigation-global-context-config.service';
import {
  NodeChangeHookConfigService,
  NodeChangeHookConfigServiceImpl,
} from './services/luigi-config/node-change-hook-config.service';
import {
  NoopUserProfileConfigService,
  UserProfileConfigService,
} from './services/luigi-config/user-profile-config.service';
import {
  NoopUserSettingsConfigService,
  UserSettingsConfigService,
} from './services/luigi-config/user-settings-config.service';
import {
  GlobalSearchConfigService,
  NoopGlobalSearchConfigService,
} from './services/luigi-config/global-search-config.service';
import {
  CustomGlobalNodesService,
  CustomGlobalNodesServiceImpl,
} from './services/luigi-nodes/custom-global-nodes.service';
import {
  LuigiNodeExtendedContextService,
  LuigiNodeExtendedContextServiceImpl,
} from './services/luigi-nodes/luigi-node-extended-context.service';
import {
  NodeAccessHandlingService,
  NoopNodeAccessHandlingService,
} from './services/luigi-nodes/node-access-handling.service';

export interface PortalModuleOptions {
  /** Service containing and providing the luigi settings configuration **/
  staticSettingsConfigService?: Type<StaticSettingsConfigService>;

  /** A set of class representing custom listeners **/
  customMessageListeners?: Type<CustomMessageListener>[];

  /** Service providing local nodes merging services **/
  localNodesService?: Type<LocalNodesService>;

  /** Service providing user setting specific configuration **/
  userSettingsConfigService?: Type<UserSettingsConfigService>;

  /** Service providing global search configuration **/
  globalSearchConfigService?: Type<GlobalSearchConfigService>;

  /** **/
  appSwitcherConfigService?: Type<AppSwitcherConfigService>;

  /** **/
  navigationGlobalContextConfigService?: Type<NavigationGlobalContextConfigService>;

  /** **/
  luigiNodeExtendedContextService?: Type<LuigiNodeExtendedContextService>;

  /** **/
  customGlobalNodesService?: Type<CustomGlobalNodesService>;

  /** **/
  userProfileConfigService?: Type<UserProfileConfigService>;

  /** **/
  luigiBreadcrumbConfigService?: Type<LuigiBreadcrumbConfigService>;

  /** **/
  nodeChangeHookConfigService?: Type<NodeChangeHookConfigService>;

  /** **/
  nodeAccessHandlingService?: Type<NodeAccessHandlingService>;
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
      provide: LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
      useClass: NoopNodeAccessHandlingService,
    },
    {
      provide: LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass: NodeChangeHookConfigServiceImpl,
    },
    {
      provide: LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: NoopLuigiBreadcrumbConfigService,
    },
    {
      provide: LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: NoopUserProfileConfigService,
    },
    {
      provide: LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
      useClass: CustomGlobalNodesServiceImpl,
    },
    {
      provide: LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN,
      useClass: LuigiNodeExtendedContextServiceImpl,
    },
    {
      provide: LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: NavigationGlobalContextConfigServiceImpl,
    },
    {
      provide: LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: NoopAppSwitcherConfigService,
    },
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
          provide: LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
          useClass:
            options.nodeAccessHandlingService || NoopNodeAccessHandlingService,
        },
        {
          provide: LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
          useClass:
            options.nodeChangeHookConfigService ||
            NodeChangeHookConfigServiceImpl,
        },
        {
          provide: LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.luigiBreadcrumbConfigService ||
            NoopLuigiBreadcrumbConfigService,
        },
        {
          provide: LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.userProfileConfigService || NoopUserProfileConfigService,
        },
        {
          provide: LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
          useClass:
            options.customGlobalNodesService || CustomGlobalNodesServiceImpl,
        },
        {
          provide: LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN,
          useClass:
            options.luigiNodeExtendedContextService ||
            LuigiNodeExtendedContextServiceImpl,
        },
        {
          provide:
            LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.navigationGlobalContextConfigService ||
            NavigationGlobalContextConfigServiceImpl,
        },
        {
          provide: LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
          useClass:
            options.appSwitcherConfigService || NoopAppSwitcherConfigService,
        },
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

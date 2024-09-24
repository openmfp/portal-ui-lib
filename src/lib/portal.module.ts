import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ErrorComponent } from './components/error/error.component';
import {
  LOCAL_NODES_SERVICE_INJECTION_TOKEN,
  LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
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
  AppSwitcherConfigService,
  NoopAppSwitcherConfigService,
  LuigiBreadcrumbConfigService,
  NoopLuigiBreadcrumbConfigService,
  NavigationGlobalContextConfigService,
  NavigationGlobalContextConfigServiceImpl,
  NodeChangeHookConfigService,
  NodeChangeHookConfigServiceImpl,
  NoopUserProfileConfigService,
  UserProfileConfigService,
  NoopUserSettingsConfigService,
  UserSettingsConfigService,
  GlobalSearchConfigService,
  NoopGlobalSearchConfigService,
  CustomGlobalNodesService,
  CustomGlobalNodesServiceImpl,
  LuigiNodeExtendedContextService,
  LuigiNodeExtendedContextServiceImpl,
  NodeAccessHandlingService,
  NoopNodeAccessHandlingService,
  LuigiAuthEventsCallbacksService,
  NoopLuigiAuthEventsCallbacksService,
  NoopLocalNodesService,
} from './services';

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

  /** Service providing luigi app switcher configuration **/
  appSwitcherConfigService?: Type<AppSwitcherConfigService>;

  /** Service providing luigi navigation global context configuration **/
  navigationGlobalContextConfigService?: Type<NavigationGlobalContextConfigService>;

  /** Service providing luigi node extended context configuration **/
  luigiNodeExtendedContextService?: Type<LuigiNodeExtendedContextService>;

  /** Service providing custom global level nodes **/
  customGlobalNodesService?: Type<CustomGlobalNodesService>;

  /** Service providing luigi user profile configuration **/
  userProfileConfigService?: Type<UserProfileConfigService>;

  /** Service providing luigi breadcrumb configuration **/
  luigiBreadcrumbConfigService?: Type<LuigiBreadcrumbConfigService>;

  /** Service providing custom global level nodes **/
  nodeChangeHookConfigService?: Type<NodeChangeHookConfigService>;

  /** Service handling every node access policies **/
  nodeAccessHandlingService?: Type<NodeAccessHandlingService>;

  /** Service handling luigi authentication events **/
  luigiAuthEventsCallbacksService?: Type<LuigiAuthEventsCallbacksService>;
}

@NgModule({
  declarations: [
    ErrorComponent,
    LuigiComponent,
    PortalComponent,
    CallbackComponent,
    LogoutComponent,
  ],
  providers: [
    {
      provide: LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
      useClass: NoopLuigiAuthEventsCallbacksService,
    },
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
  static forRoot(
    options: PortalModuleOptions = {}
  ): ModuleWithProviders<PortalModule> {
    const customMessageListeners = (options.customMessageListeners || []).map(
      (customMessageListenerClass) => ({
        provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
        multi: true,
        useClass: customMessageListenerClass,
      })
    );

    return {
      ngModule: PortalModule,
      providers: [
        ...customMessageListeners,
        {
          provide: LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
          useClass:
            options.luigiAuthEventsCallbacksService ||
            NoopLuigiAuthEventsCallbacksService,
        },
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
    };
  }
}

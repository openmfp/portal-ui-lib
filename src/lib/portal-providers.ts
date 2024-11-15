import { provideHttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideZoneChangeDetection,
  Type,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import {
  provideBootstrap,
  provideNavigationTracker,
  provideSessionRefresh,
} from './initializers';
import {
  LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
  LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
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

import { portalRouts } from './portal-routing';
import {
  AppSwitcherConfigService,
  CustomGlobalNodesService,
  CustomGlobalNodesServiceImpl,
  CustomMessageListener,
  GlobalSearchConfigService,
  LocalConfigurationService,
  LuigiAuthEventsCallbacksService,
  LuigiBreadcrumbConfigService,
  LuigiNodeExtendedContextService,
  LuigiNodeExtendedContextServiceImpl,
  NavigationGlobalContextConfigService,
  NavigationGlobalContextConfigServiceImpl,
  NodeAccessHandlingService,
  NodeChangeHookConfigService,
  NodeChangeHookConfigServiceImpl,
  NoopAppSwitcherConfigService,
  NoopGlobalSearchConfigService,
  NoopLuigiAuthEventsCallbacksService,
  NoopLuigiBreadcrumbConfigService,
  NoopNodeAccessHandlingService,
  NoopUserProfileConfigService,
  NoopUserSettingsConfigService,
  StaticSettingsConfigService,
  StaticSettingsConfigServiceImpl,
  UserProfileConfigService,
  UserSettingsConfigService,
  LocalConfigurationServiceImpl,
} from './services';
import { CustomReuseStrategy } from './utilities';

export interface PortalOptions {
  /** Service containing and providing the luigi settings configuration **/
  staticSettingsConfigService?: Type<StaticSettingsConfigService>;

  /** A set of class representing custom listeners **/
  customMessageListeners?: Type<CustomMessageListener>[];

  /** Service providing local configuration services **/
  localConfigurationService?: Type<LocalConfigurationService>;

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

export function providePortal(
  options: PortalOptions = {}
): EnvironmentProviders {
  const customMessageListeners = (options.customMessageListeners || []).map(
    (customMessageListenerClass) => ({
      provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
      multi: true,
      useClass: customMessageListenerClass,
    })
  );

  return makeEnvironmentProviders([
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBootstrap(),
    provideSessionRefresh(),
    provideNavigationTracker(),
    provideRouter(portalRouts),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
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
        options.nodeChangeHookConfigService || NodeChangeHookConfigServiceImpl,
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
      provide: LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
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
        options.staticSettingsConfigService || StaticSettingsConfigServiceImpl,
    },
    {
      provide: LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
      useClass:
        options.localConfigurationService || LocalConfigurationServiceImpl,
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
  ]);
}

import { provideHttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Provider,
  provideZoneChangeDetection,
  Type,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import {
  provideBootstrap,
  provideNavigationTracker,
  provideSessionRefresh,
} from './initializers';
import { provideLanguageServices } from './initializers/language-initializer';
import {
  LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
  LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
  LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
  LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from './injection-tokens';

import { portalRouts } from './portal-routing';
import {
  AppSwitcherConfigService,
  CustomGlobalNodesService,
  CustomMessageListener,
  GlobalSearchConfigService,
  LocalConfigurationService,
  LuigiAuthEventsCallbacksService,
  LuigiBreadcrumbConfigService,
  LuigiExtendedGlobalContextConfigService,
  NodeAccessHandlingService,
  NodeChangeHookConfigService,
  NodeChangeHookConfigServiceImpl,
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

  /** Service providing luigi node extended context configuration **/
  luigiExtendedGlobalContextConfigService?: Type<LuigiExtendedGlobalContextConfigService>;

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
  const providers: (Provider | EnvironmentProviders)[] = [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBootstrap(),
    provideSessionRefresh(),
    provideNavigationTracker(),
    provideLanguageServices(),
    provideRouter(portalRouts),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    {
      provide: LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass:
        options.nodeChangeHookConfigService || NodeChangeHookConfigServiceImpl,
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
    ...addOptionalProviders(options),
  ];

  return makeEnvironmentProviders(providers);
}

const addOptionalProviders = (
  options: PortalOptions
): (Provider | EnvironmentProviders)[] => {
  const providers = [];
  (options.customMessageListeners || []).forEach((customMessageListenerClass) =>
    providers.push({
      provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
      multi: true,
      useClass: customMessageListenerClass,
    })
  );

  if (options.luigiAuthEventsCallbacksService) {
    providers.push({
      provide: LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
      useClass: options.luigiAuthEventsCallbacksService,
    });
  }

  if (options.nodeAccessHandlingService) {
    providers.push({
      provide: LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
      useClass: options.nodeAccessHandlingService,
    });
  }

  if (options.luigiBreadcrumbConfigService) {
    providers.push({
      provide: LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.luigiBreadcrumbConfigService,
    });
  }

  if (options.userProfileConfigService) {
    providers.push({
      provide: LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.userProfileConfigService,
    });
  }

  if (options.customGlobalNodesService) {
    providers.push({
      provide: LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
      useClass: options.customGlobalNodesService,
    });
  }

  if (options.luigiExtendedGlobalContextConfigService) {
    providers.push({
      provide: LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.luigiExtendedGlobalContextConfigService,
    });
  }

  if (options.appSwitcherConfigService) {
    providers.push({
      provide: LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.appSwitcherConfigService,
    });
  }

  if (options.userSettingsConfigService) {
    providers.push({
      provide: LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.userSettingsConfigService,
    });
  }

  if (options.globalSearchConfigService) {
    providers.push({
      provide: LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.globalSearchConfigService,
    });
  }

  return providers;
};

import {
  provideBootstrap,
  provideLanguageServices,
  provideNavigationTracker,
  provideSessionRefresh,
} from './initializers';
import {
  ERROR_COMPONENT_CONFIG,
  HEADER_BAR_CONFIG_INJECTION_TOKEN,
  LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
  LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
  LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
  LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
  LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN,
  LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
  LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
  THEMING_SERVICE,
} from './injection-tokens';
import { ErrorComponentConfig } from './models';
import { portalRouts } from './portal-routing';
import {
  AppSwitcherConfigService,
  AppSwitcherConfigServiceImpl,
  CustomGlobalNodesService,
  CustomMessageListener,
  CustomNodeProcessingService,
  GlobalSearchConfigService,
  HeaderBarConfig,
  LocalConfigurationService,
  LuigiAuthEventsCallbacksService,
  LuigiBreadcrumbConfigService,
  LuigiExtendedGlobalContextConfigService,
  NodeChangeHookConfigService,
  StaticSettingsConfigService,
  ThemingService,
  UserProfileConfigService,
  UserProfileConfigServiceImpl,
  UserSettingsConfigService,
} from './services';
import { NodeContextProcessingService } from './services/luigi-nodes/node-context-processing.service';
import { CustomReuseStrategy } from './utilities';
import { provideHttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  Provider,
  Type,
  makeEnvironmentProviders,
  provideZoneChangeDetection,
} from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';

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

  /** Service providing custom global level nodes **/
  nodeContextProcessingService?: Type<NodeContextProcessingService>;

  /** Service providing luigi user profile configuration **/
  userProfileConfigService?: Type<UserProfileConfigService>;

  /** Service providing luigi breadcrumb configuration **/
  luigiBreadcrumbConfigService?: Type<LuigiBreadcrumbConfigService>;

  /** Provide a config that contains renderers for Nav Bar */
  headerBarConfig?: HeaderBarConfig;

  /** Service providing custom global level nodes **/
  nodeChangeHookConfigService?: Type<NodeChangeHookConfigService>;

  /** Service handling every node access policies **/
  customNodeProcessingService?: Type<CustomNodeProcessingService>;

  /** Service handling luigi authentication events **/
  luigiAuthEventsCallbacksService?: Type<LuigiAuthEventsCallbacksService>;

  /** Provide a error configuration for error component to override the default values **/
  errorComponentConfig?: Record<string, ErrorComponentConfig>;

  /** Provide a error configuration for error component to override the default values **/
  themingService?: Type<ThemingService>;
}

export function providePortal(
  options: PortalOptions = {},
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
    ...addOptionalProviders(options),
  ];

  return makeEnvironmentProviders(providers);
}

const addOptionalProviders = (
  options: PortalOptions,
): (Provider | EnvironmentProviders)[] => {
  const providers = [];
  (options.customMessageListeners || []).forEach((customMessageListenerClass) =>
    providers.push({
      provide: LUIGI_CUSTOM_MESSAGE_LISTENERS_INJECTION_TOKEN,
      multi: true,
      useClass: customMessageListenerClass,
    }),
  );

  providers.push(
    {
      provide: LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass:
        options.appSwitcherConfigService || AppSwitcherConfigServiceImpl,
    },
    {
      provide: LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass:
        options.userProfileConfigService || UserProfileConfigServiceImpl,
    },
  );

  if (options.luigiExtendedGlobalContextConfigService) {
    providers.push({
      provide: LUIGI_EXTENDED_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.luigiExtendedGlobalContextConfigService,
    });
  }

  if (options.nodeChangeHookConfigService) {
    providers.push({
      provide: LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
      useClass: options.nodeChangeHookConfigService,
    });
  }

  if (options.nodeContextProcessingService) {
    providers.push({
      provide: LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
      useClass: options.nodeContextProcessingService,
    });
  }

  if (options.localConfigurationService) {
    providers.push({
      provide: LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
      useClass: options.localConfigurationService,
    });
  }

  if (options.staticSettingsConfigService) {
    providers.push({
      provide: LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.staticSettingsConfigService,
    });
  }

  if (options.luigiAuthEventsCallbacksService) {
    providers.push({
      provide: LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN,
      useClass: options.luigiAuthEventsCallbacksService,
    });
  }

  if (options.customNodeProcessingService) {
    providers.push({
      provide: LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN,
      useClass: options.customNodeProcessingService,
    });
  }

  if (options.luigiBreadcrumbConfigService) {
    providers.push({
      provide: LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.luigiBreadcrumbConfigService,
    });
  }

  if (options.customGlobalNodesService) {
    providers.push({
      provide: LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
      useClass: options.customGlobalNodesService,
    });
  }

  if (options.themingService) {
    providers.push({
      provide: THEMING_SERVICE,
      useClass: options.themingService,
    });
  }

  if (options.globalSearchConfigService) {
    providers.push({
      provide: LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
      useClass: options.globalSearchConfigService,
    });
  }

  if (options.errorComponentConfig) {
    providers.push({
      provide: ERROR_COMPONENT_CONFIG,
      useValue: options.errorComponentConfig,
    });
  }

  if (options.headerBarConfig) {
    providers.push({
      provide: HEADER_BAR_CONFIG_INJECTION_TOKEN,
      useValue: options.headerBarConfig,
    });
  }

  return providers;
};

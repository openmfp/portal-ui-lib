import { LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode } from '../../models';
import { FeatureTogglesService } from '../feature-toggles.service';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { AuthConfigService } from './auth-config.service';
import { CustomMessageListenersService } from './custom-message-listeners.service';
import { GlobalSearchConfigService } from './global-search-config.service';
import { NavigationConfigService } from './navigation-config.service';
import { RoutingConfigServiceImpl } from './routing-config.service';
import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import { Injectable, inject } from '@angular/core';
import { $localize } from '@angular/localize/init';

@Injectable({ providedIn: 'root' })
export class LifecycleHooksConfigService {
  private featureTogglesService = inject(FeatureTogglesService);
  private authConfigService = inject(AuthConfigService);
  private customMessageListenersService = inject(CustomMessageListenersService);
  private i18nService = inject(I18nService);
  private luigiNodesService = inject(LuigiNodesService);
  private luigiCoreService = inject(LuigiCoreService);
  private routingConfigService = inject(RoutingConfigServiceImpl);
  private navigationConfigService = inject(NavigationConfigService);
  private userSettingsConfigService = inject(UserSettingsConfigService);
  private staticSettingsConfigService = inject(StaticSettingsConfigServiceImpl);
  private globalSearchConfigService = inject<GlobalSearchConfigService>(
    LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );

  getLifecycleHooksConfig() {
    return {
      luigiAfterInit: () => {
        return this.constructLuigiConfiguration();
      },
    };
  }

  private async constructLuigiConfiguration() {
    this.i18nService.afterInit();
    void this.featureTogglesService.initFeatureToggles();

    let childrenByEntity: Record<string, LuigiNode[]>;
    try {
      childrenByEntity =
        await this.luigiNodesService.retrieveChildrenByEntity();
    } catch (e) {
      console.error('Error retrieving Luigi navigation nodes', e);
      this.openErrorDialog();
      return;
    }

    const config = {
      auth: await this.authConfigService.getAuthConfig(),
      settings:
        await this.staticSettingsConfigService.getStaticSettingsConfig(),
      communication: this.customMessageListenersService.getMessageListeners(),
      navigation:
        await this.navigationConfigService.getNavigationConfig(
          childrenByEntity,
        ),
      routing: this.routingConfigService.getRoutingConfig(),
      userSettings:
        await this.userSettingsConfigService.getUserSettings(childrenByEntity),
      globalSearch: this.globalSearchConfigService?.getGlobalSearchConfig(),
    };

    this.luigiCoreService.setConfig(config);
    this.luigiCoreService.ux().hideAppLoadingIndicator();
  }

  private openErrorDialog() {
    const appTitle = this.luigiCoreService.config?.settings?.header?.title;
    this.luigiCoreService.showAlert({
      text: $localize`There was an error loading the ${appTitle}`,
      type: 'error',
    });
  }
}

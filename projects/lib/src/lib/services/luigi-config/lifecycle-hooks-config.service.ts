import { inject, Injectable } from '@angular/core';
import { $localize } from '@angular/localize/init';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { GlobalSearchConfigService } from './global-search-config.service';
import { NavigationConfigService } from './navigation-config.service';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigServiceImpl } from './static-settings-config.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import { LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode, ClientEnvironment } from '../../models';
import { localDevelopmentSettingsLocalStorage } from '../storage-service';

@Injectable({ providedIn: 'root' })
export class LifecycleHooksConfigService {
  private i18nService = inject(I18nService);
  private luigiNodesService = inject(LuigiNodesService);
  private luigiCoreService = inject(LuigiCoreService);
  private routingConfigService = inject(RoutingConfigService);
  private navigationConfigService = inject(NavigationConfigService);
  private userSettingsConfigService = inject(UserSettingsConfigService);
  private staticSettingsConfigService = inject(StaticSettingsConfigServiceImpl);
  private globalSearchConfigService = inject<GlobalSearchConfigService>(
    LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN as any,
    { optional: true }
  );

  getLifecycleHooksConfig(envConfig: ClientEnvironment) {
    return {
      luigiAfterInit: async () => {
        this.i18nService.afterInit();

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
          ...this.luigiCoreService.config,
          lifecycleHooks: {},
          navigation: await this.navigationConfigService.getNavigationConfig(
            childrenByEntity,
            envConfig
          ),
          routing: this.routingConfigService.getRoutingConfig(),
          settings:
            await this.staticSettingsConfigService.getStaticSettingsConfig(),
          userSettings:
            await this.userSettingsConfigService.getUserSettings(
              childrenByEntity
            ),
          globalSearch: this.globalSearchConfigService?.getGlobalSearchConfig(),
        };

        this.luigiCoreService.ux().hideAppLoadingIndicator();
        this.luigiCoreService.setConfig(config);
        if (this.luigiCoreService.isFeatureToggleActive('btpLayout')) {
          this.luigiCoreService.resetLuigi();
        }
        this.addLocalDevelopmentModeOnIndicator();
      },
    };
  }

  private openErrorDialog() {
    const appTitle = this.luigiCoreService.config.settings.header.title;
    this.luigiCoreService.showAlert({
      text: $localize`There was an error loading the ${appTitle}`,
      type: 'error',
    });
  }

  addLocalDevelopmentModeOnIndicator() {
    if (localDevelopmentSettingsLocalStorage.read()?.isActive) {
      const popoverControl = document.querySelector('#profilePopover');

      if (popoverControl && popoverControl.parentNode) {
        const newSpan = document.createElement('span');
        newSpan.classList.add(
          'sap-icon--developer-settings',
          'local-development-settings-indication'
        );
        newSpan.title = this.i18nService.getTranslation(
          'LOCAL_DEVELOPMENT_SETTINGS_ACTIVE_INDICATOR'
        );
        popoverControl.parentNode.appendChild(newSpan);
      }
    }
  }
}

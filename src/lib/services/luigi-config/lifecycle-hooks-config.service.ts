import { Inject, Injectable } from '@angular/core';
import { $localize } from '@angular/localize/init';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { GlobalSearchConfigService } from './global-search-config.service';
import { RoutingConfigService } from './routing-config.service';
import { StaticSettingsConfigService } from './static-settings-config.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import {
  LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { LuigiNode } from '../../models/luigi';
import { ClientEnvironment } from '../../models/env';

@Injectable({ providedIn: 'root' })
export class LifecycleHooksConfigService {
  constructor(
    private i18nService: I18nService,
    private luigiNodesService: LuigiNodesService,
    private luigiCoreService: LuigiCoreService,
    private routingConfigService: RoutingConfigService,
    @Inject(LUIGI_STATIC_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN)
    private staticSettingsConfigService: StaticSettingsConfigService,
    @Inject(LUIGI_USER_SETTINGS_CONFIG_SERVICE_INJECTION_TOKEN)
    private userSettingsConfigService: UserSettingsConfigService,
    @Inject(LUIGI_GLOBAL_SEARCH_CONFIG_SERVICE_INJECTION_TOKEN)
    private globalSearchConfigService: GlobalSearchConfigService
  ) {}

  getLifecycleHooksConfig(envConfig: ClientEnvironment) {
    return {
      luigiAfterInit: async () => {
        this.i18nService.afterInit();

        let childrenByEntity: Record<string, LuigiNode[]>;
        try {
          childrenByEntity =
            await this.luigiNodesService.retrieveChildrenByEntity();
        } catch (e) {
          console.error(`Error retrieving Luigi navigation nodes ${e}`);
          this.openErrorDialog();
        }

        const config = {
          ...this.luigiCoreService.getConfig(),
          lifecycleHooks: {},
          settings:
            await this.staticSettingsConfigService.getStaticSettingsConfig(),
          routing: this.routingConfigService.getRoutingConfig(),
          userSettings:
            await this.userSettingsConfigService.getUserSettings(
              childrenByEntity
            ),
          globalSearch: this.globalSearchConfigService.getGlobalSearchConfig(),
        };

        this.luigiCoreService.ux().hideAppLoadingIndicator();
        this.luigiCoreService.setConfig(config);
        if (this.luigiCoreService.isFeatureToggleActive('btpLayout')) {
          this.luigiCoreService.resetLuigi();
        }
      },
    };
  }

  private openErrorDialog() {
    const appTitle =
      this.staticSettingsConfigService.getInitialStaticSettingsConfig()[
        'header'
      ].title;
    this.luigiCoreService
      .showAlert({
        text: $localize`There was an error loading the ${appTitle}`,
        type: 'error',
      })
      .then(() => {
        location.reload();
      });
  }
}

import {
  AuthConfigService,
  AuthService,
  LuigiCoreService,
  StaticSettingsConfigServiceImpl,
} from '../../services';
import { FeatureTogglesService } from '../../services/feature-toggles.service';
import { LifecycleHooksConfigService } from '../../services/luigi-config/lifecycle-hooks-config.service';
import { RoutingConfigServiceImpl } from '../../services/luigi-config/routing-config.service';
import { Component, OnInit, inject } from '@angular/core';

@Component({
  template: '',
  standalone: true,
})
export class LuigiComponent implements OnInit {
  private lifecycleHooksConfigService = inject(LifecycleHooksConfigService);
  private luigiCoreService = inject(LuigiCoreService);
  private authService = inject(AuthService);
  private routingConfigService = inject(RoutingConfigServiceImpl);
  private authConfigService = inject(AuthConfigService);
  private staticSettingsConfigService = inject(StaticSettingsConfigServiceImpl);
  private featureTogglesService = inject(FeatureTogglesService);

  async ngOnInit(): Promise<void> {
    await this.featureTogglesService.initFeatureToggles();

    try {
      this.luigiCoreService.setConfig({
        auth: await this.authConfigService.getAuthConfig(),
        routing: this.routingConfigService.getInitialRoutingConfig(),
        lifecycleHooks:
          this.lifecycleHooksConfigService.getLifecycleHooksConfig(),
        settings:
          await this.staticSettingsConfigService.getStaticSettingsConfig(),
      });
      this.luigiCoreService.setAuthData(this.authService.getAuthData());
    } catch (e) {
      console.error(`Luigi Component init failed: ${e.toString()}`);
    }
  }
}

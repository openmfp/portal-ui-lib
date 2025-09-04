import { AuthService } from '../../services';
import { LuigiCoreService } from '../../services';
import { AuthConfigService } from '../../services/luigi-config/auth-config.service';
import { LifecycleHooksConfigService } from '../../services/luigi-config/lifecycle-hooks-config.service';
import { RoutingConfigService } from '../../services/luigi-config/routing-config.service';
import { Component, OnInit, inject } from '@angular/core';

@Component({
  template: '',
  standalone: true,
})
export class LuigiComponent implements OnInit {
  private lifecycleHooksConfigService = inject(LifecycleHooksConfigService);
  private luigiCoreService = inject(LuigiCoreService);
  private authService = inject(AuthService);
  private routingConfigService = inject(RoutingConfigService);
  private authConfigService = inject(AuthConfigService);

  async ngOnInit(): Promise<void> {
    try {
      const auth = this.authService.getAuthData();
      this.luigiCoreService.setAuthData(auth);
      this.luigiCoreService.setConfig({
        auth: await this.authConfigService.getAuthConfig(),
        routing: this.routingConfigService.getInitialRoutingConfig(),
        lifecycleHooks:
          this.lifecycleHooksConfigService.getLifecycleHooksConfig(),
      });
    } catch (e) {
      console.error(`Luigi Component init failed: ${e.toString()}`);
    }
  }
}

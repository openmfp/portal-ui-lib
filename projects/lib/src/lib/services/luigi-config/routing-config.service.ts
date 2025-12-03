import { LUIGI_ROUTING_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { Injectable, inject } from '@angular/core';

export interface RoutingConfigService {
  getInitialRoutingConfig?(): object;
  getRoutingConfig?(): object;
}

@Injectable({ providedIn: 'root' })
export class RoutingConfigServiceImpl implements RoutingConfigService {
  private customRoutingConfigService = inject<RoutingConfigService>(
    LUIGI_ROUTING_CONFIG_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );

  getInitialRoutingConfig(): any {
    return {
      useHashRouting: false,
      showModalPathInUrl: false,
      modalPathParam: 'modalPathParamDisabled',
      skipRoutingForUrlPatterns: [/.*/],
      pageNotFoundHandler: () => {},
      ...(this.customRoutingConfigService?.getInitialRoutingConfig?.() || {}),
    };
  }

  getRoutingConfig(): any {
    return {
      useHashRouting: false,
      showModalPathInUrl: true,
      modalPathParam: 'modal',
      pageNotFoundHandler: () => {},
      ...(this.customRoutingConfigService?.getRoutingConfig?.() || {}),
    };
  }
}

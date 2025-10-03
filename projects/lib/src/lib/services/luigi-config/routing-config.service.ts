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
    console.log('getInitialRoutingConfig', this.customRoutingConfigService);
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
      pageNotFoundHandler: (
        notFoundPath: string,
        isAnyPathMatched: boolean,
      ) => {
        console.log('pageNotFoundHandler', this.customRoutingConfigService);
        return {
          redirectTo: 'error/404',
          keepURL: true,
        };
      },
      ...(this.customRoutingConfigService?.getRoutingConfig?.() || {}),
    };
  }
}

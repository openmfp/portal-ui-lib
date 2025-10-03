import { EnvConfigService } from '../portal';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoutingConfigService {
  private envConfigService = inject(EnvConfigService);
  getInitialRoutingConfig(): any {
    return {
      useHashRouting: false,
      showModalPathInUrl: false,
      modalPathParam: 'modalPathParamDisabled',
      skipRoutingForUrlPatterns: [/.*/],
      pageNotFoundHandler: () => {},
    };
  }

  getRoutingConfig(): any {
    return {
      useHashRouting: false,
      showModalPathInUrl: true,
      modalPathParam: 'modal',
      pageNotFoundHandler: async (
        notFoundPath: string,
        isAnyPathMatched: boolean,
      ) => {
        const { baseDomain } = await this.envConfigService.getEnvConfig();
        if (window.location.hostname !== baseDomain) {
          return {
            redirectTo: 'welcome',
            keepURL: true,
          };
        }

        return {
          redirectTo: 'error/404',
          keepURL: true,
        };
      },
    };
  }
}

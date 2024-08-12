import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoutingConfigService {
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
      pageNotFoundHandler: (
        notFoundPath: string,
        isAnyPathMatched: boolean
      ) => {
        return {
          redirectTo: 'error/404',
          keepURL: true,
        };
      },
    };
  }
}

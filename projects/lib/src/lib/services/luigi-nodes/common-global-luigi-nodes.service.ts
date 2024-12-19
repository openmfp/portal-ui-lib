import { Injectable } from '@angular/core';
import { LuigiNode } from '../../models';

@Injectable({ providedIn: 'root' })
export class CommonGlobalLuigiNodesService {
  public getContentNotFoundGlobalNode(): LuigiNode {
    return {
      pathSegment: 'error',
      label: 'Content not found',
      hideFromNav: true,
      children: [
        {
          pathSegment: ':id',
          hideSideNav: true,
          viewUrl: '/error-handling#:id',
          context: { id: ':id' },
          loadingIndicator: { enabled: false },
          showBreadcrumbs: false,
        },
      ],
    };
  }
}

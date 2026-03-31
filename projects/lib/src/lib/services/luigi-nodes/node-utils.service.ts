import { LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NodeUtilsService {
  constructor(private luigiCoreService: LuigiCoreService) {}

  retrieveGlobalHelpContext() {
    return (node: LuigiNode) => {
      const ctx = this.luigiCoreService.getGlobalContext();
      node.context.helpContext = ctx.helpContext;
      return true;
    };
  }

  isVisible(node: LuigiNode): boolean {
    if (!node.visibleForFeatureToggles || node.visibleForFeatureToggles.length === 0) {
      return true;
    }
    return node.visibleForFeatureToggles.some((ft) => {
      if (ft.startsWith('!')) {
        return !this.luigiCoreService.isFeatureToggleActive(ft.slice(1));
      }
      return this.luigiCoreService.isFeatureToggleActive(ft);
    });
  }
}

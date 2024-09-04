import { Injectable } from '@angular/core';
import { HelpContext, LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';

@Injectable({ providedIn: 'root' })
export class NodeUtilsService {
  constructor(private luigiCoreService: LuigiCoreService) {}

  retrieveHelpContext(ctx: { helpContext: HelpContext }) {
    return (node: LuigiNode) => {
      node.context.helpContext = ctx.helpContext;
      return true;
    };
  }

  isVisible(node: LuigiNode): boolean {
    if (!node.visibleForFeatureToggles) {
      return true;
    }
    return node.visibleForFeatureToggles.every((ft) => {
      if (ft.startsWith('!')) {
        return !this.luigiCoreService.isFeatureToggleActive(ft.slice(1));
      }
      return this.luigiCoreService.isFeatureToggleActive(ft);
    });
  }
}

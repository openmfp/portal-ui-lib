import { Injectable } from '@angular/core';
import { HelpContext, LuigiNode } from '../../models/luigi';
import { LuigiCoreService } from '../luigi-core.service';

export interface NodeChangeHookConfigService {
  nodeChangeHook(
    prevNode: LuigiNode,
    nextNode: LuigiNode,
    ctx: {
      helpContext: HelpContext;
    }
  );
}

@Injectable({ providedIn: 'root' })
export class NodeChangeHookConfigServiceImpl
  implements NodeChangeHookConfigService
{
  constructor(private luigiCoreService: LuigiCoreService) {}

  nodeChangeHook(
    prevNode: LuigiNode,
    nextNode: LuigiNode,
    ctx: {
      helpContext: HelpContext;
    }
  ) {
    if (
      nextNode.initialRoute &&
      nextNode.virtualTree &&
      !(nextNode as any)._virtualTree
    ) {
      this.luigiCoreService.navigation().navigate(nextNode.initialRoute);
    }
  }
}

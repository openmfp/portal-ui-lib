import { Injectable } from '@angular/core';
import { LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';

export interface NodeChangeHookConfigService {
  nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode);
}

@Injectable({ providedIn: 'root' })
export class NodeChangeHookConfigServiceImpl
  implements NodeChangeHookConfigService
{
  constructor(private luigiCoreService: LuigiCoreService) {}

  nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode) {
    if (
      nextNode.initialRoute &&
      nextNode.virtualTree &&
      !(nextNode as any)._virtualTree
    ) {
      this.luigiCoreService.navigation().navigate(nextNode.initialRoute);
    }
  }
}

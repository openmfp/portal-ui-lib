import { LuigiNode, kcpRootOrgsPath } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { GatewayService } from '../resource';
import { Injectable, inject } from '@angular/core';

export interface NodeChangeHookConfigService {
  nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode): void;
}

@Injectable({ providedIn: 'root' })
export class NodeChangeHookConfigServiceImpl
  implements NodeChangeHookConfigService
{
  private luigiCoreService = inject(LuigiCoreService);
  private gatewayService = inject(GatewayService);

  nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode) {
    if (
      nextNode.initialRoute &&
      nextNode.virtualTree &&
      !(nextNode as any)._virtualTree
    ) {
      this.luigiCoreService.navigation().navigate(nextNode.initialRoute);
    }

    this.resolveCrdGatewayKcpPath(nextNode);
  }

  private resolveCrdGatewayKcpPath(nextNode: LuigiNode) {
    let entityKcpPath = '';
    let node = nextNode;
    do {
      const id = node.context?.entityContext?.account?.id;
      if (id) {
        entityKcpPath = `:${id}${entityKcpPath}`;
      }
      node = node.parent;
    } while (node);

    const org = this.luigiCoreService.getGlobalContext().organization;
    const kcpPath =
      nextNode.context?.kcpPath || `${kcpRootOrgsPath}:${org}${entityKcpPath}`;
    this.gatewayService.updateCrdGatewayUrlWithEntityPath(kcpPath);
  }
}

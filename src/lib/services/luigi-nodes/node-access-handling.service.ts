import { Injectable } from '@angular/core';
import { Context } from '@luigi-project/client';
import { ClientEnvironment, LuigiNode, PortalConfig } from '../../models';

export interface NodeAccessHandlingService {
  nodeAccessHandling(
    ctx: Context,
    node: LuigiNode,
    portalConfig: PortalConfig,
    clientEnvironment: ClientEnvironment
  ): LuigiNode;
}

@Injectable({ providedIn: 'root' })
export class NoopNodeAccessHandlingService
  implements NodeAccessHandlingService
{
  nodeAccessHandling(
    ctx: Context,
    node: LuigiNode,
    portalConfig: PortalConfig,
    clientEnvironment: ClientEnvironment
  ): LuigiNode {
    return node;
  }
}

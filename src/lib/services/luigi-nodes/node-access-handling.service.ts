import { Injectable } from '@angular/core';
import { Context } from '@luigi-project/client';
import { ClientEnvironment } from '../../models/env';
import { LuigiNode } from '../../models/luigi';
import { PortalConfig } from '../../models/portal';

export interface NodeAccessHandlingService {
  nodeAccessHandling(
    ctx: Context,
    node: LuigiNode,
    frameConfig: PortalConfig,
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

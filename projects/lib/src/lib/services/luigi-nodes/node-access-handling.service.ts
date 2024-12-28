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

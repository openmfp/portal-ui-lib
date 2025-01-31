import { Context } from '@luigi-project/client';
import { LuigiNode } from '../../models';

export interface NodeAccessHandlingService {
  nodeAccessHandling(ctx: Context, node: LuigiNode): Promise<LuigiNode>;
}

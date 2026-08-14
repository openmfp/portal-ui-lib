import { LuigiNode } from '../../models';
import { Context } from '@luigi-project/client';

export interface CustomNodeProcessingService {
  processNode(ctx: Context, node: LuigiNode): Promise<LuigiNode>;
}

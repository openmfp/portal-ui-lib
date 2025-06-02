import { Context } from '@luigi-project/client';
import { LuigiNode } from '../../models';

export interface CustomNodeProcessingService {
  processNode(ctx: Context, node: LuigiNode): Promise<LuigiNode>;
}

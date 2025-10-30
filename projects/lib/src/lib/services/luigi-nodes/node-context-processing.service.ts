import { LuigiNode, NodeContext } from '../../models';


export interface NodeContextProcessingService {
  processNodeContext(
    entityId: string | undefined,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ): Promise<void>;
}
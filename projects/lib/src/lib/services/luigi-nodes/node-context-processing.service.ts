import { LuigiNode, NodeContext } from '../../models';

export interface NodeContextProcessingService {
  processNodeContext(
    entityId: string,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ): void;
}

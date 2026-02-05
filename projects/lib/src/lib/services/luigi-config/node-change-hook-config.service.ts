import { LuigiNode, NodeContext } from '../../models';

export interface NodeChangeHookConfigService {
  nodeChangeHook(
    prevNode: LuigiNode,
    nextNode: LuigiNode,
    currentContext: NodeContext,
  ): void;
}

import { LuigiNode } from '../../models';

export interface NodeChangeHookConfigService {
  nodeChangeHook(prevNode: LuigiNode, nextNode: LuigiNode): void;
}

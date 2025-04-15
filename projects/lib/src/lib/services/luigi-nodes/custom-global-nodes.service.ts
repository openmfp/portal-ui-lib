import { LuigiNode } from '../../models';

export interface CustomGlobalNodesService {
  getCustomGlobalNodes(): Promise<LuigiNode[]>;
}

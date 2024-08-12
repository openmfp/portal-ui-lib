import { LuigiNode } from '../../models/luigi';

export interface LocalNodesService {
  replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[]
  ): Promise<LuigiNode[]>;

  getLocalNodes(): Promise<LuigiNode[]>;
}

export class NoopLocalNodesService implements LocalNodesService {
  async getLocalNodes(): Promise<LuigiNode[]> {
    return [];
  }

  async replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[]
  ): Promise<LuigiNode[]> {
    return serverLuigiNodes;
  }
}

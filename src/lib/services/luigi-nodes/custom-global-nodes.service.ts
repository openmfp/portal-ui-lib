import { Injectable } from '@angular/core';
import { HelpContext, LuigiNode } from '../../models/luigi';

export interface CustomGlobalNodesService {
  getCustomGlobalNodes(ctx: { helpContext: HelpContext }): Promise<LuigiNode[]>;
}

@Injectable({ providedIn: 'root' })
export class CustomGlobalNodesServiceImpl implements CustomGlobalNodesService {
  async getCustomGlobalNodes(ctx: {
    helpContext: HelpContext;
  }): Promise<LuigiNode[]> {
    return [];
  }
}

import { Injectable } from '@angular/core';
import { LuigiNode } from '../../models';

export interface CustomGlobalNodesService {
  getCustomGlobalNodes(): Promise<LuigiNode[]>;
}

@Injectable({ providedIn: 'root' })
export class CustomGlobalNodesServiceImpl implements CustomGlobalNodesService {
  async getCustomGlobalNodes(): Promise<LuigiNode[]> {
    return [];
  }
}

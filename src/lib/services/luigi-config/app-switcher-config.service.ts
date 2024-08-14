import { Injectable } from '@angular/core';
import { LuigiNode } from '../../models/luigi';

export interface AppSwitcherConfigService {
  getAppSwitcher(luigiNodes: LuigiNode[]);
}

@Injectable({ providedIn: 'root' })
export class NoopAppSwitcherConfigService implements AppSwitcherConfigService {
  getAppSwitcher() {
    return undefined;
  }
}

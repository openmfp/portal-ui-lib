import { LuigiNode } from '../../models';

export interface AppSwitcherConfigService {
  getAppSwitcher(luigiNodes: LuigiNode[]);
}

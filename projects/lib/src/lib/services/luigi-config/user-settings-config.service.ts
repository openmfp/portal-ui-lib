import { LuigiNode } from '../../models';

export interface UserSettingsConfigService {
  getUserSettings(luigiNodes: Record<string, LuigiNode[]>): Promise<any>;
}

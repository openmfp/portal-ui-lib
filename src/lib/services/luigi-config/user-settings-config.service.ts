import { LuigiNode } from '../../models/luigi';

export interface UserSettingsConfigService {
  getUserSettings(luigiNodes: Record<string, LuigiNode[]>): Promise<any>;
}

export class NoopUserSettingsConfigService
  implements UserSettingsConfigService
{
  async getUserSettings(luigiNodes: Record<string, LuigiNode[]>): Promise<any> {
    return undefined;
  }
}

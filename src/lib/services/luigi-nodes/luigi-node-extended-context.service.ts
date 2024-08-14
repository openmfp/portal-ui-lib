import { Injectable } from '@angular/core';
import { ClientEnvironment } from '../../models/env';
import { ConfigService } from '../portal/config.service';

export interface LuigiNodeExtendedContextService {
  createLuigiNodeContext(
    envConfig: ClientEnvironment
  ): Promise<Record<string, any>>;
}

@Injectable({ providedIn: 'root' })
export class LuigiNodeExtendedContextServiceImpl
  implements LuigiNodeExtendedContextService
{
  constructor(private configService: ConfigService) {}

  async createLuigiNodeContext(
    envConfig: ClientEnvironment
  ): Promise<Record<string, any>> {
    const portalConfig = await this.configService.getPortalConfig();
    return {
      portalContext: portalConfig.portalContext,
    };
  }
}

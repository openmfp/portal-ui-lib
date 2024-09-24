import { Injectable } from '@angular/core';
import { ClientEnvironment } from '../../models';
import { AuthService, ConfigService } from '../portal';

export interface LuigiNodeExtendedContextService {
  createLuigiNodeContext(
    envConfig: ClientEnvironment
  ): Promise<Record<string, any>>;
}

@Injectable({ providedIn: 'root' })
export class LuigiNodeExtendedContextServiceImpl
  implements LuigiNodeExtendedContextService
{
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {}

  async createLuigiNodeContext(
    envConfig: ClientEnvironment
  ): Promise<Record<string, any>> {
    const portalConfig = await this.configService.getPortalConfig();
    return {
      userid: this.authService.getUsername(),
      portalContext: portalConfig.portalContext,
    };
  }
}

import { AuthService, ConfigService, EnvConfigService } from '../portal';
import { ResourceService } from '../resource';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface LuigiExtendedGlobalContextConfigService {
  createLuigiExtendedGlobalContext(): Promise<Record<string, any>>;
}

@Injectable({ providedIn: 'root' })
export class OpenmfpLuigiExtendedGlobalContextConfigService
  implements LuigiExtendedGlobalContextConfigService
{
  private resourceService = inject(ResourceService);
  private envConfigService = inject(EnvConfigService);
  private configService = inject(ConfigService);
  private authService = inject(AuthService);

  async createLuigiExtendedGlobalContext(): Promise<Record<string, any>> {
    const portalConfig = await this.configService.getPortalConfig();
    const entityId = (await this.envConfigService.getEnvConfig()).organization;
    const operation = 'core_openmfp_org';
    const kind = 'Account';
    const queryPart = '{ metadata { name annotations } }';

    try {
      const resource = await firstValueFrom(
        this.resourceService.read(
          entityId,
          operation,
          kind,
          `query ($name: String!) { ${operation} { ${kind}(name: $name) ${queryPart} }}`,
          {
            portalContext: {
              crdGatewayApiUrl: portalConfig.portalContext.crdGatewayApiUrl,
            },
            token: this.authService.getToken(),
            accountId: entityId,
          },
        ),
      );

      return {
        organizationId: `${resource.metadata.annotations['kcp.io/cluster']}/${entityId}`,
        entityId: `${resource.metadata.annotations['kcp.io/cluster']}/${entityId}`, // if no entity selected the entityId is the same as the organizationId
      };
    } catch (e) {
      console.error(`Not able to read entity ${entityId} from ${operation}`);
    }
    return {};
  }
}

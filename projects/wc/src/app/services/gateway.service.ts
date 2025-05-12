import { Injectable, inject } from '@angular/core';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private luigiCoreService = inject(LuigiCoreService);

  public getGatewayUrl() {
    const ctx = this.luigiCoreService.getWcExtendedContext() || {};
    let gatewayUrl = ctx?.portalContext?.crdGatewayApiUrl;
    return gatewayUrl?.replace('${kcp-path}', this.getKcpPath());
  }

  public getKcpPath() {
    const defaultKcpPath = 'root:orgs';
    const globalCtx = this.luigiCoreService.getGlobalContext();
    const ctx = this.luigiCoreService.getWcExtendedContext() || {};
    const modalCtx = this.luigiCoreService.getWcModalExtendedContext() || {};

    let kcpPath = '';
    if (modalCtx.kcpPath || ctx.kcpPath) {
      kcpPath = modalCtx.kcpPath || ctx.kcpPath;
    } else if (ctx.accountId) {
      kcpPath = `${defaultKcpPath}:${globalCtx.organization}:${ctx.accountId}`;
    } else {
      kcpPath = `${defaultKcpPath}:${globalCtx.organization}`;
    }

    return kcpPath;
  }
}

import { LuigiCoreService } from '../luigi-core.service';
import { ResourceNodeContext } from './resource-node-context';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private luigiCoreService = inject(LuigiCoreService);

  public getGatewayUrl(
    nodeContext: ResourceNodeContext,
    readFromParentKcpPath = false,
  ) {
    const gatewayUrl = nodeContext.portalContext.crdGatewayApiUrl;
    const kcpPathRegexp = /\/([^\/]+)\/graphql$/;
    const currentKcpPath = gatewayUrl?.match(kcpPathRegexp)[1];
    return gatewayUrl?.replace(
      currentKcpPath,
      this.resolveKcpPath(nodeContext, readFromParentKcpPath),
    );
  }

  public updateCrdGatewayUrlWithEntityPath(kcpPath: string) {
    const gatewayUrl =
      this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl;
    const kcpPathRegexp = /(.*\/)[^/]+(?=\/graphql$)/;
    this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl =
      gatewayUrl.replace(kcpPathRegexp, `$1${kcpPath}`);
  }

  public resolveKcpPath(
    nodeContext: ResourceNodeContext,
    readFromParentKcpPath = false,
  ) {
    const gatewayUrl = nodeContext.portalContext.crdGatewayApiUrl;
    const currentKcpPath = gatewayUrl?.match(/\/([^\/]+)\/graphql$/)[1];

    let kcpPath = currentKcpPath;
    if (nodeContext.kcpPath) {
      kcpPath = nodeContext.kcpPath;
    } else if (readFromParentKcpPath) {
      const lastIndex = currentKcpPath.lastIndexOf(`:${nodeContext.accountId}`);
      if (lastIndex !== -1) {
        kcpPath = currentKcpPath.slice(0, lastIndex);
      }
    }

    return kcpPath;
  }
}

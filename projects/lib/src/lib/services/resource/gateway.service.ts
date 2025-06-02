import { NodeContext } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private luigiCoreService = inject(LuigiCoreService);

  public getGatewayUrl(
    nodeContext: NodeContext,
    readFromParentKcpPath = false,
  ) {
    const gatewayUrl =
      this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl;
    const currentKcpPath = gatewayUrl?.match(/\/([^\/]+)\/graphql$/)[1];
    return gatewayUrl?.replace(
      currentKcpPath,
      this.resolveKcpPath(nodeContext, readFromParentKcpPath),
    );
  }

  public updateCrdGatewayUrlWithEntityPath(kcpPath: string) {
    const gatewayUrl =
      this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl;
    this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl =
      gatewayUrl.replace(/(.*\/)[^/]+(?=\/graphql$)/, `$1${kcpPath}`);

    console.log('PATH');
    console.log(
      this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl,
    );
  }

  public resolveKcpPath(
    nodeContext: NodeContext,
    readFromParentKcpPath = false,
  ) {
    const gatewayUrl =
      this.luigiCoreService.getGlobalContext().portalContext.crdGatewayApiUrl;
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

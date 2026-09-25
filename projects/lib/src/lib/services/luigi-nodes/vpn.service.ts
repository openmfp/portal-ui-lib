import { LuigiNode, NetworkVisibility, NodeContext } from '../../models';
import { potentialVPNResourceLoadable } from '../../utilities';
import { I18nService } from '../i18n.service';
import { EnvConfigService } from '../portal';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VPNService {
  private envConfigService = inject(EnvConfigService);
  private i18nService = inject(I18nService);

  private inVPN = false;
  private readonly ready = this.init();

  public whenReady(): Promise<void> {
    return this.ready;
  }

  public setVPN(inVPN: boolean) {
    this.inVPN = inVPN;
  }

  public applyNetworkVisibility(node: LuigiNode): LuigiNode {
    if (node.networkVisibility !== NetworkVisibility.INTERNAL) {
      return node;
    }

    return this.inVPN ? node : this.convertToNoVPNHandlingNode(node);
  }

  private async init(): Promise<void> {
    try {
      const url = (await this.envConfigService.getEnvConfig()).vpnCheckUrl;

      if (!url) {
        this.inVPN = true;
        return;
      }

      this.inVPN = await potentialVPNResourceLoadable(url);
    } catch {
      this.inVPN = true;
    }
  }

  private convertToNoVPNHandlingNode(originalNode: LuigiNode): LuigiNode {
    const fieldOverwrites: LuigiNode = {
      viewUrl: '/assets/openmfp-portal-ui-wc.js#no-vpn',
      webcomponent: {
        selfRegistered: true,
        type: 'module',
      },
      context: {
        translationTable: this.i18nService.translationTable,
      } as NodeContext,
      networkVisibility: undefined,
      visibleForPlugin: undefined,
      children: [],
    };

    if (!originalNode.statusBadge) {
      fieldOverwrites.statusBadge = {
        label: 'VPN',
        type: 'informative',
      };
    }

    return Object.assign({}, originalNode, fieldOverwrites);
  }
}

import { inject, Injectable } from '@angular/core';
import { LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';

@Injectable({
  providedIn: 'root',
})
export class IframeService {
  private luigiCoreService = inject(LuigiCoreService);

  private isIFrameFeaturePolicyAllowed(policy: string, iframeURL: string) {
    // should be connected to a still to be developed permission management logic
    return true;
  }

  private isIFrameSandboxPermissionAllowed(policy: string, iframeURL: string) {
    // should be connected to a still to be developed permission management logic
    return true;
  }

  public iFrameCreationInterceptor() {
    return (iframe, viewGroup: string, navigationNode, microFrontendType) => {
      this.applyIframePermissions(iframe, navigationNode, viewGroup);
    };
  }

  private applyIframePermissions(
    iframe: Element,
    node: LuigiNode,
    viewGroup: string
  ): void {
    let permissions = node?.requiredIFramePermissions;

    if (!permissions && viewGroup) {
      const viewGroupSettings = this.luigiCoreService.getConfigValue(
        'navigation.viewGroupSettings'
      );
      const viewGroupConfig =
        (viewGroupSettings && viewGroupSettings[viewGroup]) || {};
      permissions = viewGroupConfig.requiredIFramePermissions;
    }

    if (!permissions) {
      return;
    }

    if (permissions.allow) {
      let allow = (iframe.getAttribute('allow') || '').trim();
      if (allow.length > 0 && !allow.endsWith(';')) {
        allow += ';';
      }
      permissions.allow.forEach((policy) => {
        if (
          this.isIFrameFeaturePolicyAllowed(policy, this.getIframeSrc(iframe))
        ) {
          // feature policies are separated by semicolon
          allow += ` ${policy};`;
        }
      });
      iframe.setAttribute('allow', allow.trim());
    }

    if (permissions.sandbox) {
      let sandbox = (iframe.getAttribute('sandbox') || '').trim();
      permissions.sandbox.forEach((permission) => {
        if (
          this.isIFrameSandboxPermissionAllowed(
            permission,
            this.getIframeSrc(iframe)
          )
        ) {
          // sandbox permission are separated by whitespace
          sandbox += ' ' + permission;
        }
      });
      iframe.setAttribute('sandbox', sandbox.trim());
    }
  }

  private getIframeSrc(iframe: Element): string {
    const src = iframe.getAttribute('src');
    if (!src) {
      this.luigiCoreService.showAlert({
        text: 'Iframe source not found',
        type: 'error',
      });

      throw new Error('Iframe source not found');
    }

    return src;
  }
}

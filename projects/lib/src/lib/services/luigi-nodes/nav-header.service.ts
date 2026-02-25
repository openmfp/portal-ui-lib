import { LuigiNode, NavHeader } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavHeaderService {
  private luigiCoreService = inject(LuigiCoreService);

  setupNavigationHeader(entityNode: LuigiNode): void {
    if (entityNode.defineEntity) {
      this.setShowUpLink(entityNode);

      if (!entityNode.navHeader) {
        return;
      }

      entityNode.navHeader.renderer = (
        containerElement: HTMLElement,
        nodeItem: LuigiNode,
        clickHandler: Function,
        navHeader: NavHeader,
      ) => {
        if (!containerElement || !navHeader?.label) {
          return;
        }

        const label = this.sanitizeString(navHeader.label);
        const type = this.sanitizeString(
          navHeader.type ??
            this.getSideNavigationHeaderType(navHeader.context, nodeItem),
        );
        containerElement.classList.add('entity-nav-header');
        containerElement.innerHTML = `
            <ui5-text class="entity-nav-header-type">${type}</ui5-text>
            <ui5-title class="entity-nav-header-label" level="H6" size="H6">${label}</ui5-title>
        `;
      };
    }
  }

  private setShowUpLink(entityNode: LuigiNode): void {
    const hasNavHeaderBeforeInit = !!entityNode.navHeader;
    if (
      entityNode.defineEntity?.useBack &&
      this.luigiCoreService.isFeatureToggleActive('navheader-up') &&
      hasNavHeaderBeforeInit &&
      typeof entityNode.navHeader === 'object'
    ) {
      entityNode.navHeader.showUpLink = true;
    }
  }

  private getSideNavigationHeaderType(
    nodeContext: Record<string, any> = {},
    nodeItem: LuigiNode,
  ): string {
    const dynamicFetchId = nodeItem.defineEntity?.dynamicFetchId || '';
    let type = (nodeContext.entityContext?.[dynamicFetchId] || {}).type;
    if (!type || typeof type !== 'string') {
      type =
        nodeItem.defineEntity?.label ||
        nodeItem.defineEntity?.type ||
        dynamicFetchId ||
        'Extension';
    }

    type = type.replace(/Id/i, '');
    return type.at(0).toUpperCase() + type.slice(1);
  }

  private sanitizeString(inputString: string): string {
    const tempSpan = document.createElement('span');
    tempSpan.textContent = inputString;
    return tempSpan.innerHTML;
  }
}

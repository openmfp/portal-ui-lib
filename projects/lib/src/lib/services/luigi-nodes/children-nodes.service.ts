import { LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode } from '../../models';
import {
  computeFetchContext,
  visibleForContext,
} from '../../utilities/context';
import { LuigiCoreService } from '../luigi-core.service';
import { ConfigService } from '../portal';
import { CustomNodeProcessingService } from './node-access-handling.service';
import { NodeSortingService } from './node-sorting.service';
import { NodeUtilsService } from './node-utils.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChildrenNodesService {
  private luigiCoreService = inject(LuigiCoreService);
  private configService = inject(ConfigService);
  private nodeUtilsService = inject(NodeUtilsService);
  private nodeSortingService = inject(NodeSortingService);
  private customNodeProcessingService = inject<CustomNodeProcessingService>(
    LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );

  async processChildrenForEntity(
    entityNode: LuigiNode,
    children: LuigiNode[],
    ctx: any,
  ): Promise<LuigiNode[]> {
    if (
      entityNode.defineEntity?.useBack &&
      this.luigiCoreService.isFeatureToggleActive('navheader-up') &&
      entityNode.navHeader
    ) {
      entityNode.navHeader.showUpLink = true;
    }

    this.addBtpLayoutNavigationHeader(entityNode);

    if (!children) {
      return [];
    }

    const entityContext = {};

    const fetchContext = computeFetchContext(entityNode, ctx);
    await Promise.all(
      Array.from(fetchContext.entries()).map(
        async ([dynamicFetchId, context]) => {
          try {
            entityContext[dynamicFetchId] = (
              await this.configService.getEntityConfig(dynamicFetchId, context)
            ).entityContext;
          } catch (error) {
            console.error(
              entityNode.defineEntity.id,
              'does not exist',
              context,
            );
          }
        },
      ),
    );

    children.forEach((child) => {
      child.context = { ...child.context, entityContext };
      child.onNodeActivation =
        this.nodeUtilsService.retrieveGlobalHelpContext();
    });

    const nodes = await Promise.all(
      children
        .filter((child) => visibleForContext(child.context, child))
        .map(
          (child) =>
            this.customNodeProcessingService?.nodeAccessHandling(
              child.context,
              child,
            ) || child,
        ),
    );
    return this.nodeSortingService.sortNodes(nodes);
  }

  addBtpLayoutNavigationHeader(entityNode: LuigiNode) {
    if (
      entityNode.defineEntity &&
      this.luigiCoreService.config.settings.btpToolLayout
    ) {
      if (!entityNode.navHeader) {
        entityNode.navHeader = {};
      }

      entityNode.navHeader.renderer = (
        containerElement: HTMLElement,
        nodeItem: LuigiNode,
        clickHandler: Function,
        navHeader: any,
      ) => {
        if (!containerElement || !navHeader?.label) {
          return;
        }

        const label = navHeader.label;
        const type = this.getSideNavigationHeaderType(
          navHeader.context,
          nodeItem,
        );
        containerElement.classList.add('entity-nav-header');
        containerElement.innerHTML = `
            <ui5-text class="entity-nav-header-type">${type}</ui5-text>
            <ui5-title class="entity-nav-header-label" level="H6" size="H6">${label}</ui5-title>
        `;
      };
    }
  }

  private getSideNavigationHeaderType(
    nodeContext: Record<string, any> = {},
    nodeItem: LuigiNode,
  ): string {
    const dynamicFetchId = nodeItem.defineEntity?.dynamicFetchId || '';
    let type = (nodeContext.entityContext?.[dynamicFetchId] || {}).type;
    if (!type || typeof type !== 'string') {
      type = nodeItem.defineEntity?.label || dynamicFetchId || 'Extension';
    }
    type = type.replace(/Id/i, '');
    return type.at(0).toUpperCase() + type.slice(1);
  }
}

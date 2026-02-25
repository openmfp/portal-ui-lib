import { LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode } from '../../models';
import {
  computeDynamicFetchContext,
  visibleForContext,
} from '../../utilities/context';
import { ConfigService } from '../portal';
import { CustomNodeProcessingService } from './custom-node-processing.service';
import { NavHeaderService } from './nav-header.service';
import { NodeSortingService } from './node-sorting.service';
import { NodeUtilsService } from './node-utils.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChildrenNodesService {
  private navHeaderService = inject(NavHeaderService);
  private configService = inject(ConfigService);
  private nodeUtilsService = inject(NodeUtilsService);
  private nodeSortingService = inject(NodeSortingService);
  private customNodeProcessingService = inject<CustomNodeProcessingService>(
    LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );

  async processChildrenForEntity(
    entityNode: LuigiNode,
    childrenNodes: LuigiNode[],
    ctx: any,
  ): Promise<LuigiNode[]> {
    this.navHeaderService.setupNavigationHeader(entityNode);

    if (!childrenNodes) {
      return [];
    }

    const entityContext = {};

    const fetchContext = computeDynamicFetchContext(entityNode, ctx);
    await Promise.all(
      Array.from(fetchContext.entries()).map(
        async ([dynamicFetchId, context]) => {
          try {
            entityContext[dynamicFetchId] = (
              await this.configService.getEntityConfig(dynamicFetchId, context)
            ).entityContext;
          } catch (error) {
            console.error(
              entityNode.defineEntity?.id,
              'does not exist',
              context,
            );
          }
        },
      ),
    );

    childrenNodes.forEach((child) => {
      child.context = { ...child.context, entityContext };
      child.onNodeActivation =
        this.nodeUtilsService.retrieveGlobalHelpContext();
    });

    const nodes = await Promise.all(
      childrenNodes
        .filter((child) => visibleForContext(child.context, child))
        .map(
          (child) =>
            this.customNodeProcessingService?.processNode(
              child.context,
              child,
            ) || child,
        ),
    );
    return this.nodeSortingService.sortNodes(nodes);
  }
}

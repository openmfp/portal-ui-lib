import {
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { LuigiNode } from '../../models';
import { EntityType } from '../../models/entity';
import {
  computeFetchContext,
  visibleForContext,
} from '../../utilities/context';
import { ChildrenNodesService } from './children-nodes.service';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { CustomGlobalNodesService } from './custom-global-nodes.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeAccessHandlingService } from './node-access-handling.service';
import { NodeSortingService } from './node-sorting.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NodesProcessingService {
  private luigiNodesService = inject(LuigiNodesService);
  private nodeSortingService = inject(NodeSortingService);
  private childrenNodesService = inject(ChildrenNodesService);
  private commonGlobalLuigiNodesService = inject(CommonGlobalLuigiNodesService);
  private nodeAccessHandlingService = inject<NodeAccessHandlingService>(
    LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );
  private customGlobalNodesService = inject<CustomGlobalNodesService>(
    LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );

  async processNodes(childrenByEntity: Record<string, LuigiNode[]>) {
    const globalNodes = [
      ...(childrenByEntity[EntityType.GLOBAL] || []),
      ...(childrenByEntity[EntityType.GLOBAL_TOPNAV] || []),
      ...((await this.customGlobalNodesService?.getCustomGlobalNodes()) || []),
      ...this.commonGlobalLuigiNodesService.getContentNotFoundGlobalNode(),
    ];

    globalNodes.forEach((node) => {
      node.context = { ...node.context };
      node.globalNav = this.isGlobalNavNode(node);
      this.applyEntityChildrenRecursively(node, childrenByEntity, '');
    });

    globalNodes.sort(this.nodeSortingService.nodeComparison);
    return globalNodes;
  }

  private isGlobalNavNode(node: LuigiNode) {
    return !node.hideFromNav && node.entityType === EntityType.GLOBAL;
  }

  applyEntityChildrenRecursively(
    node: LuigiNode,
    childrenByEntity: Record<string, LuigiNode[]>,
    parentEntityPath: string,
  ) {
    if (Array.isArray(node.children)) {
      this.nodeSortingService.markEntityRootChildren(node.children);
      node._portalDirectChildren = node.children;
    }
    const directChildren = node._portalDirectChildren || [];
    let newEntityPath = parentEntityPath;
    if (node.defineEntity) {
      if (parentEntityPath?.length > 0) {
        newEntityPath = parentEntityPath + '.' + node.defineEntity.id;
      } else {
        newEntityPath = node.defineEntity.id;
      }

      node.children = (ctx: any) => {
        return this.entityChildrenProvider(
          node,
          ctx,
          childrenByEntity,
          directChildren,
          newEntityPath,
        );
      };

      if (node.compound) {
        if (!node.compound._staticChildren) {
          node.compound._staticChildren = node.compound.children || [];
        }
        const additionalChildren =
          childrenByEntity[newEntityPath + '::compound'] || [];
        let children = [
          ...node.compound._staticChildren,
          ...additionalChildren,
        ].sort(this.nodeSortingService.nodeComparison);

        Object.defineProperty(node.compound, 'children', {
          set: (newValue) => (children = newValue),
          get: () => {
            children.forEach((child) => {
              child.context.entityContext = {
                ...child.context.entityContext,
                ...node.context.entityContext,
              };
            });
            return children.filter((child) =>
              visibleForContext(child.context, child),
            );
          },
          configurable: true,
        });
      }
    } else {
      directChildren.forEach((child) => {
        this.applyEntityChildrenRecursively(
          child,
          childrenByEntity,
          newEntityPath,
        );
      });
      node.children = async (ctx: any) =>
        await Promise.all(
          directChildren
            .filter((child) => visibleForContext(ctx, child))
            .map(
              (child) =>
                this.nodeAccessHandlingService?.nodeAccessHandling(
                  ctx,
                  child,
                ) || child,
            ),
        );
    }

    if (node.virtualTree) {
      node.children = undefined;
    }
  }

  entityChildrenProvider(
    entityNode: LuigiNode,
    ctx: any,
    childrenByEntity: Record<string, LuigiNode[]>,
    directChildren?: LuigiNode[],
    entityPath?: string,
  ) {
    const createChildrenList = (
      children: LuigiNode[],
      staticChildren?: LuigiNode[],
    ) => {
      const entityRootChildren = staticChildren ? [] : children;
      let mergedChildrenByEntity = childrenByEntity;
      if (staticChildren) {
        const entityChildrenByEntity: Record<string, LuigiNode[]> = {};

        children?.forEach((child) => {
          if (
            child.entityType === entityPath ||
            child.entityType === EntityType.ENTITY_ERROR ||
            staticChildren.includes(child)
          ) {
            entityRootChildren.push(child);
          } else if (child.entityType) {
            if (!entityChildrenByEntity[child.entityType]) {
              entityChildrenByEntity[child.entityType] = [];
            }
            entityChildrenByEntity[child.entityType].push(child);
          } else {
            console.warn('Ignored entity child, no entity type defined', child);
          }
        });
        mergedChildrenByEntity = { ...childrenByEntity };
        Object.keys(entityChildrenByEntity).forEach((key) => {
          const existingNodes = mergedChildrenByEntity[key];
          mergedChildrenByEntity[key] = existingNodes
            ? [...existingNodes, ...entityChildrenByEntity[key]]
            : entityChildrenByEntity[key];
        });
      }

      entityRootChildren.forEach((child) => {
        this.applyEntityChildrenRecursively(
          child,
          mergedChildrenByEntity,
          entityPath,
        );
      });
      return this.childrenNodesService.buildChildrenForEntity(
        entityNode,
        entityRootChildren,
        ctx,
      );
    };

    return new Promise<LuigiNode[]>(async (resolve, reject) => {
      const entityTypeId = entityPath || entityNode?.defineEntity?.id;
      const entityIdContextKey = entityNode?.defineEntity?.contextKey;
      if (!entityTypeId) {
        console.warn('No entity node!'); //TODO: check if needed or assured before
        resolve(createChildrenList(directChildren));
      } else {
        const entityId = ctx[entityIdContextKey];
        const staticChildren = [
          ...(directChildren || []),
          ...(childrenByEntity[entityTypeId] || []),
        ];

        if (entityId && entityNode?.defineEntity?.dynamicFetchId) {
          const fetchContext = computeFetchContext(entityNode, ctx);
          const dynamicFetchId = entityNode.defineEntity.dynamicFetchId;
          this.luigiNodesService
            .retrieveAndMergeEntityChildren(
              entityNode.defineEntity,
              staticChildren,
              entityPath,
              fetchContext.get(dynamicFetchId),
            )
            .then((children) => {
              resolve(createChildrenList(children, staticChildren));
            })
            .catch((error) => {
              resolve(createChildrenList(staticChildren));
            });
        } else {
          const childrenList = await createChildrenList(staticChildren);
          console.debug(`children list ${childrenList.length}`);
          resolve(
            this.luigiNodesService.replaceServerNodesWithLocalOnes(
              childrenList,
              [entityPath],
            ),
          );
        }
      }
    });
  }
}

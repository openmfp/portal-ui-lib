import {
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { LuigiNode, NodeContext } from '../../models';
import { EntityType } from '../../models/entity';
import {
  computeFetchContext,
  visibleForContext,
} from '../../utilities/context';
import { LuigiCoreService } from '../luigi-core.service';
import { GatewayService, ResourceService } from '../resource';
import { ChildrenNodesService } from './children-nodes.service';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { CustomGlobalNodesService } from './custom-global-nodes.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeAccessHandlingService } from './node-access-handling.service';
import { NodeSortingService } from './node-sorting.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NodesProcessingService {
  private resourceService = inject(ResourceService);
  private luigiCoreService = inject(LuigiCoreService);
  private gatewayService = inject(GatewayService);
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

    if (node.defineEntity) {
      this.processNodeDefineEntity(
        node,
        childrenByEntity,
        parentEntityPath,
        directChildren,
      );
    } else {
      directChildren.forEach((child) => {
        this.applyEntityChildrenRecursively(
          child,
          childrenByEntity,
          parentEntityPath,
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

  private processNodeDefineEntity(
    node: LuigiNode,
    childrenByEntity: Record<string, LuigiNode[]>,
    parentEntityPath: string,
    directChildren: LuigiNode[],
  ) {
    let newEntityPath = parentEntityPath;
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

    this.processCompoundNode(node, childrenByEntity, newEntityPath);
  }

  processCompoundNode(
    node: LuigiNode,
    childrenByEntity: Record<string, LuigiNode[]>,
    newEntityPath: string,
  ) {
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
  }

  entityChildrenProvider(
    entityNode: LuigiNode,
    ctx: any,
    childrenByEntity: Record<string, LuigiNode[]>,
    directChildren?: LuigiNode[],
    entityPath?: string,
  ) {
    return new Promise<LuigiNode[]>(async (resolve, reject) => {
      const entityTypeId = entityPath || entityNode?.defineEntity?.id;
      const entityIdContextKey = entityNode?.defineEntity?.contextKey;
      if (!entityTypeId) {
        console.warn('No entity node!'); //TODO: check if needed or assured before
        resolve(
          this.createChildrenList(
            entityNode,
            ctx,
            childrenByEntity,
            directChildren,
            entityPath,
          ),
        );
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
              resolve(
                this.createChildrenList(
                  entityNode,
                  ctx,
                  childrenByEntity,
                  children,
                  entityPath,
                  staticChildren,
                ),
              );
            })
            .catch((error) => {
              resolve(
                this.createChildrenList(
                  entityNode,
                  ctx,
                  childrenByEntity,
                  staticChildren,
                  entityPath,
                ),
              );
            });

          this.readAndStoreEntityInNodeContext(entityId, entityNode, ctx);
        } else {
          const childrenList = await this.createChildrenList(
            entityNode,
            ctx,
            childrenByEntity,
            staticChildren,
            entityPath,
          );
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

  private createChildrenList(
    entityNode: LuigiNode,
    ctx: any,
    childrenByEntity: Record<string, LuigiNode[]>,
    children: LuigiNode[],
    entityPath?: string,
    staticChildren?: LuigiNode[],
  ) {
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
    return this.childrenNodesService.processChildrenForEntity(
      entityNode,
      entityRootChildren,
      ctx,
    );
  }

  readAndStoreEntityInNodeContext(
    entityId: string,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ) {
    const group =
      entityNode.defineEntity?.graphqlEntity?.group || 'core.openmfp.org';
    const kind = entityNode.defineEntity?.graphqlEntity?.kind || 'Account';
    const queryPart =
      entityNode.defineEntity?.graphqlEntity?.query ||
      '{ metadata { name annotations }}';

    if (!entityId || !group || !kind || !queryPart) {
      return;
    }

    const operation = group.replaceAll('.', '_');
    try {
      this.resourceService
        .read(
          entityId,
          operation,
          kind,
          `query ($name: String!) { ${operation} { ${kind}(name: $name) ${queryPart} }}`,
          this.luigiCoreService.getGlobalContext(),
        )
        .subscribe({
          next: (entity) => {
            // update the current calculated context
            ctx.entity = entity;
            // update the node context to contain the entity for future context calculations
            entityNode.context.entity = entity;
          },
        });
    } catch (error) {
      console.error(`Not able to read entity ${entityId} from ${operation}`);
    }
  }
}

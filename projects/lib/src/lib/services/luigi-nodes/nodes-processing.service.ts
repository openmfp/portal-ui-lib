import { LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN, LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode } from '../../models';
import { EntityType } from '../../models/entity';
import { buildViewGroups } from '../../utilities/build-view-groups';
import {
  computeDynamicFetchContext,
  visibleForContext,
} from '../../utilities/context';
import { NavigationConfigService } from '../luigi-config/navigation-config.service';
import { LuigiCoreService } from '../luigi-core.service';
import { ChildrenNodesService } from './children-nodes.service';
import { CustomGlobalNodesService } from './custom-global-nodes.service';
import { CustomNodeProcessingService } from './custom-node-processing.service';
import { LocalConfigurationServiceImpl } from './local-configuration.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeContextProcessingServiceImpl } from './node-context-processing.service';
import { NodeSortingService } from './node-sorting.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NodesProcessingService {
  private nodeContextProcessingService = inject(
    NodeContextProcessingServiceImpl,
  );
  private luigiCoreService = inject(LuigiCoreService);
  private luigiNodesService = inject(LuigiNodesService);
  private localConfigurationService = inject(LocalConfigurationServiceImpl);
  private nodeSortingService = inject(NodeSortingService);
  private childrenNodesService = inject(ChildrenNodesService);
  private customNodeProcessingService = inject<CustomNodeProcessingService>(
    LUIGI_CUSTOM_NODE_PROCESSING_SERVICE_INJECTION_TOKEN as any,
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
      node.children = (ctx: any) =>
        Promise.all(
          directChildren
            .filter((child) => visibleForContext(ctx, child))
            .map(
              (child) =>
                this.customNodeProcessingService?.processNode(ctx, child) ||
                child,
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
    if (!node.defineEntity) {
      this.luigiCoreService.showAlert({
        text: 'Node defineEntity is missing',
        type: 'error',
      });

      throw new Error('Node defineEntity is missing');
    }

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
              ...node.context?.entityContext,
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
    directChildren: LuigiNode[],
    entityPath: string,
  ) {
    return new Promise<LuigiNode[]>(async (resolve, reject) => {
      const entityTypeId = entityPath || entityNode?.defineEntity?.id;
      const contextKey = entityNode?.defineEntity?.contextKey;
      const entityId = contextKey ? ctx[contextKey] : undefined;

      const staticChildren = [
        ...(directChildren || []),
        ...(childrenByEntity[entityTypeId ?? ''] || []),
      ];

      await this.nodeContextProcessingService?.processNodeContext(
        entityId,
        entityNode,
        ctx,
      );

      if (!entityTypeId || !entityNode.defineEntity?.dynamicFetchId) {
        const serverAndLocalNodes =
          await this.localConfigurationService.replaceServerNodesWithLocalOnes(
            staticChildren,
            [entityPath],
          );
        const childrenList = await this.createChildrenList(
          entityNode,
          ctx,
          childrenByEntity,
          entityPath,
          serverAndLocalNodes,
        );
        resolve(childrenList);
        return;
      }

      let dynamicRetrievedChildren: LuigiNode[],
        staticRetrievedChildren: LuigiNode[] | undefined;

      try {
        const fetchContext = computeDynamicFetchContext(entityNode, ctx);
        const dynamicFetchId = entityNode.defineEntity.dynamicFetchId;
        dynamicRetrievedChildren =
          await this.luigiNodesService.retrieveEntityChildren(
            entityNode.defineEntity,
            fetchContext.get(dynamicFetchId),
          );
        const serverAndLocalNodes =
          await this.localConfigurationService.replaceServerNodesWithLocalOnes(
            dynamicRetrievedChildren,
            [entityPath],
          );
        dynamicRetrievedChildren = [...staticChildren, ...serverAndLocalNodes];
        staticRetrievedChildren = staticChildren;

        this.updateLuigiConfigWithDynamichNodes(dynamicRetrievedChildren);
      } catch (error) {
        dynamicRetrievedChildren = staticChildren;
        staticRetrievedChildren = undefined;
      }

      const childrenList = await this.createChildrenList(
        entityNode,
        ctx,
        childrenByEntity,
        entityPath,
        dynamicRetrievedChildren,
        staticRetrievedChildren,
      );
      resolve(childrenList);
    });
  }

  private createChildrenList(
    entityNode: LuigiNode,
    ctx: any,
    childrenByEntity: Record<string, LuigiNode[]>,
    entityPath: string,
    children: LuigiNode[],
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

  private updateLuigiConfigWithDynamichNodes(nodes: LuigiNode[]) {
    this.updateViewGroupSettings(nodes);
  }

  private updateViewGroupSettings(nodes: LuigiNode[]) {
    const viewGroups = buildViewGroups(nodes);
    const config = this.luigiCoreService.config;

    if (config?.navigation) {
      const oldViewGroupSettings = config.navigation.viewGroupSettings;
      config.navigation.viewGroupSettings = {
        ...oldViewGroupSettings,
        ...viewGroups,
      };
      this.luigiCoreService.setConfig(config);
    }
  }
}

import { Inject, Injectable, Optional } from '@angular/core';
import { isMatch } from 'lodash';
import {
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { LuigiNode } from '../../models';
import { EntityType } from '../../models/entity';
import { matchesJMESPath } from '../../utilities';
import { ConfigService } from '../portal';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { CustomGlobalNodesService } from './custom-global-nodes.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeAccessHandlingService } from './node-access-handling.service';
import { NodeSortingService } from './node-sorting.service';
import { NodeUtilsService } from './node-utils.service';
import { LuigiCoreService } from '../luigi-core.service';

@Injectable({ providedIn: 'root' })
export class NodesProcessingService {
  constructor(
    private luigiCoreService: LuigiCoreService,
    private configService: ConfigService,
    private luigiNodesService: LuigiNodesService,
    private nodeSortingService: NodeSortingService,
    private commonGlobalLuigiNodesService: CommonGlobalLuigiNodesService,
    private nodeUtilsService: NodeUtilsService,
    @Optional()
    @Inject(LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN)
    private nodeAccessHandlingService: NodeAccessHandlingService,
    @Optional()
    @Inject(LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN)
    private customGlobalNodesService: CustomGlobalNodesService
  ) {}

  async processNodes(childrenByEntity: Record<string, LuigiNode[]>) {
    const globalNodes = [
      ...(childrenByEntity[EntityType.GLOBAL] || []),
      ...(childrenByEntity[EntityType.GLOBAL_BOTTOM] || []),
      ...(childrenByEntity[EntityType.GLOBAL_TOPNAV] || []),
      ...((await this.customGlobalNodesService?.getCustomGlobalNodes()) || []),
      ...this.commonGlobalLuigiNodesService.getContentNotFoundGlobalNode(),
    ];

    globalNodes.forEach((node) => {
      if (!node.hideFromNav && node.entityType !== EntityType.GLOBAL_TOPNAV) {
        node.globalNav =
          node.entityType === EntityType.GLOBAL_BOTTOM ? 'bottom' : true;
      }

      node.context = node.context || {};
    });

    globalNodes.forEach((node) => {
      this.applyEntityChildrenRecursively(node, childrenByEntity, '');
    });

    globalNodes.sort(this.nodeSortingService.nodeComparison);
    return globalNodes;
  }

  applyEntityChildrenRecursively(
    node: LuigiNode,
    childrenByEntity: Record<string, LuigiNode[]>,
    parentEntityPath: string
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
          newEntityPath
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
              this.visibleForContext(child.context, child)
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
          newEntityPath
        );
      });
      node.children = async (ctx: any) =>
        await Promise.all(
          directChildren
            .filter((child) => this.visibleForContext(ctx, child))
            .map(
              (child) =>
                this.nodeAccessHandlingService?.nodeAccessHandling(
                  ctx,
                  child
                ) || child
            )
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
    entityPath?: string
  ) {
    const createChildrenList = (
      children: LuigiNode[],
      staticChildren?: LuigiNode[]
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
          entityPath
        );
      });
      return this.buildChildrenForEntity(entityNode, entityRootChildren, ctx);
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
          const fetchContext = await this.computeFetchContext(entityNode, ctx);
          const dynamicFetchId = entityNode.defineEntity.dynamicFetchId;
          this.luigiNodesService
            .retrieveAndMergeEntityChildren(
              entityNode.defineEntity,
              staticChildren,
              entityPath,
              fetchContext.get(dynamicFetchId)
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
              [entityPath]
            )
          );
        }
      }
    });
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
        navHeader: any
      ) => {
        if (!containerElement || !navHeader?.label) {
          return;
        }

        const label = navHeader.label;
        const type = nodeItem.defineEntity.label || 'Extension';
        containerElement.classList.add('entity-nav-header');
        containerElement.innerHTML = `
            <ui5-text class="entity-nav-header-type">${type}</ui5-text>
            <ui5-title class="entity-nav-header-label" level="H6" size="H6">${label}</ui5-title>
        `;
      };
    }
  }

  async buildChildrenForEntity(
    entityNode: LuigiNode,
    children: LuigiNode[],
    ctx: any
  ): Promise<LuigiNode[]> {
    if (entityNode.defineEntity?.useBack) {
      if (
        globalThis.Luigi?.featureToggles()
          .getActiveFeatureToggleList()
          ?.includes('navheader-up') &&
        entityNode.navHeader
      ) {
        entityNode.navHeader.showUpLink = true;
      }
    }

    this.addBtpLayoutNavigationHeader(entityNode);

    if (!children) {
      return [];
    }

    const entityContext = {};

    const fetchContext = await this.computeFetchContext(entityNode, ctx);
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
              context
            );
          }
        }
      )
    );

    children.forEach((child) => {
      child.context = child.context || {};
      child.context.entityContext = entityContext;
      child.onNodeActivation =
        this.nodeUtilsService.retrieveGlobalHelpContext();
    });

    const nodes = await Promise.all(
      children
        .filter((child) => this.visibleForContext(child.context, child))
        .map(
          (child) =>
            this.nodeAccessHandlingService?.nodeAccessHandling(
              child.context,
              child
            ) || child
        )
    );
    return this.nodeSortingService.sortNodes(nodes);
  }

  private visibleForContext(ctx: any, node: LuigiNode): boolean {
    // visibleForEntityContext is deprecated
    if (!isMatch(ctx.entityContext, node.visibleForEntityContext)) {
      return false;
    }

    return matchesJMESPath(ctx, node.visibleForContext);
  }

  private async computeFetchContext(
    entityNode: LuigiNode,
    ctx: any
  ): Promise<Map<string, Record<string, string>>> {
    const contextForEntityConfig: Map<
      string,
      Record<string, string>
    > = new Map();

    function addToAll(key: string, value: string) {
      contextForEntityConfig.forEach((record) => {
        record[key] = value;
      });
    }

    let node = entityNode as any;
    while (node) {
      if (node.defineEntity?.contextKey && node.defineEntity?.dynamicFetchId) {
        contextForEntityConfig.set(node.defineEntity.dynamicFetchId, {});
        addToAll(
          node.defineEntity.dynamicFetchId,
          ctx[node.defineEntity.contextKey]
        );
      }
      node = node.parent;
    }

    addToAll('user', ctx.userid);
    return contextForEntityConfig;
  }
}

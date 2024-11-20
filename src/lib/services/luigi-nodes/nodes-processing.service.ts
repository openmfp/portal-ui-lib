import { Inject, Injectable } from '@angular/core';
import { isMatch } from 'lodash';
import {
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { ClientEnvironment, LuigiNode, PortalConfig } from '../../models';
import { matchesJMESPath } from '../../utilities';
import { ConfigService } from '../portal';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { CustomGlobalNodesService } from './custom-global-nodes.service';
import { LuigiNodeExtendedContextService } from './luigi-node-extended-context.service';
import { LuigiNodesService } from './luigi-nodes.service';
import { NodeAccessHandlingService } from './node-access-handling.service';
import { NodeSortingService } from './node-sorting.service';
import { NodeUtilsService } from './node-utils.service';

@Injectable({ providedIn: 'root' })
export class NodesProcessingService {
  constructor(
    private configService: ConfigService,
    private luigiNodesService: LuigiNodesService,
    private nodeSortingService: NodeSortingService,
    private commonGlobalLuigiNodesService: CommonGlobalLuigiNodesService,
    @Inject(LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN)
    private nodeAccessHandlingService: NodeAccessHandlingService,
    @Inject(LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN)
    private customGlobalNodesService: CustomGlobalNodesService,
    @Inject(LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN)
    private luigiNodeExtendedContextService: LuigiNodeExtendedContextService,
    private nodeUtilsService: NodeUtilsService
  ) {}

  async processNodes(
    childrenByEntity: Record<string, LuigiNode[]>,
    portalConfig: PortalConfig,
    envConfig?: ClientEnvironment
  ) {
    const globalNodes = [
      ...(childrenByEntity['global'] || []),
      ...(childrenByEntity['global.bottom'] || []),
      ...(childrenByEntity['global.topnav'] || []),
      ...(await this.customGlobalNodesService.getCustomGlobalNodes()),
      this.commonGlobalLuigiNodesService.getContentNotFoundGlobalNode(),
    ];

    globalNodes.forEach((node) => {
      if (!node.hideFromNav && node.entityType !== 'global.topnav') {
        node.globalNav = node.entityType === 'global.bottom' ? 'bottom' : true;
      }
    });

    globalNodes.forEach((node) => {
      this.applyEntityChildrenRecursively(
        node,
        childrenByEntity,
        '',
        envConfig,
        portalConfig
      );
    });

    globalNodes.sort(this.nodeSortingService.nodeComparison);

    // enrich context
    const nodeLuigiContext =
      await this.luigiNodeExtendedContextService.createLuigiNodeContext(
        envConfig
      );
    globalNodes.forEach((node) => {
      const ctx = node.context || {};
      node.context = { ...nodeLuigiContext, ...ctx };
    });

    return globalNodes;
  }

  applyEntityChildrenRecursively(
    node: LuigiNode,
    childrenByEntity: Record<string, LuigiNode[]>,
    parentEntityPath: string,
    envConfig: ClientEnvironment,
    portalConfig: PortalConfig
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
          envConfig,
          portalConfig,
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
          newEntityPath,
          envConfig,
          portalConfig
        );
      });
      node.children = (ctx: any) =>
        directChildren
          .filter((child) => this.visibleForContext(ctx, child))
          .map((child) =>
            this.nodeAccessHandlingService.nodeAccessHandling(
              ctx,
              child,
              portalConfig,
              envConfig
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
    envConfig: ClientEnvironment,
    portalConfig: PortalConfig,
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
            child.entityType === 'ERROR_NOT_FOUND' ||
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
          envConfig,
          portalConfig
        );
      });
      return this.buildChildrenForEntity(
        entityNode,
        entityRootChildren,
        ctx,
        portalConfig,
        envConfig
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

  async buildChildrenForEntity(
    entityNode: LuigiNode,
    children: LuigiNode[],
    ctx: any,
    portalConfig: PortalConfig,
    envConfig: ClientEnvironment
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
    return this.nodeSortingService.sortNodes(
      children
        .filter((child) => this.visibleForContext(child.context, child))
        .map((child) =>
          this.nodeAccessHandlingService.nodeAccessHandling(
            child.context,
            child,
            portalConfig,
            envConfig
          )
        )
    );
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

import { Inject, Injectable } from '@angular/core';
import { isMatch } from 'lodash';
import {
  LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN,
  LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import {
  ClientEnvironment,
  HelpContext,
  LuigiNode,
  PortalConfig,
} from '../../models';
import { matchesJMESPath } from '../../utilities';
import { LuigiCoreService } from '../luigi-core.service';
import { CommonGlobalLuigiNodesService } from '../luigi-nodes/common-global-luigi-nodes.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { ConfigService } from '../portal';
import { AppSwitcherConfigService } from './app-switcher-config.service';
import { CustomGlobalNodesService } from '../luigi-nodes/custom-global-nodes.service';
import { IntentNavigationService } from '../luigi-nodes/intent-navigation.service';
import { LuigiBreadcrumbConfigService } from './luigi-breadcrumb-config.service';
import { LuigiNodeExtendedContextService } from '../luigi-nodes/luigi-node-extended-context.service';
import { NavigationGlobalContextConfigService } from './navigation-global-context-config.service';
import { NodeAccessHandlingService } from '../luigi-nodes/node-access-handling.service';
import { NodeChangeHookConfigService } from './node-change-hook-config.service';
import { NodeUtilsService } from '../luigi-nodes/node-utils.service';
import { NodeSortingService } from '../luigi-nodes/node-sorting.service';
import { UserProfileConfigService } from './user-profile-config.service';

@Injectable({ providedIn: 'root' })
export class NavigationConfigService {
  private ctx: {
    helpContext: HelpContext;
  } = { helpContext: null };

  constructor(
    private configService: ConfigService,
    private luigiCoreService: LuigiCoreService,
    private luigiNodesService: LuigiNodesService,
    private intentNavigationService: IntentNavigationService,
    private nodeSortingService: NodeSortingService,
    private commonGlobalLuigiNodesService: CommonGlobalLuigiNodesService,
    @Inject(LUIGI_NODES_ACCESS_HANDLING_SERVICE_INJECTION_TOKEN)
    private nodeAccessHandlingService: NodeAccessHandlingService,
    @Inject(LUIGI_NODES_CUSTOM_GLOBAL_SERVICE_INJECTION_TOKEN)
    private customGlobalNodesService: CustomGlobalNodesService,
    @Inject(LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN)
    private luigiBreadcrumbConfigService: LuigiBreadcrumbConfigService,
    @Inject(LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN)
    private userProfileConfigService: UserProfileConfigService,
    @Inject(LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN)
    private nodeChangeHookConfigService: NodeChangeHookConfigService,
    @Inject(LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN)
    private appSwitcherConfigService: AppSwitcherConfigService,
    @Inject(LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN)
    private navigationGlobalContextConfigService: NavigationGlobalContextConfigService,
    @Inject(LUIGI_NODES_EXTENDED_CONTEXT_SERVICE_INJECTION_TOKEN)
    private luigiNodeExtendedContextService: LuigiNodeExtendedContextService,
    private nodeUtilsService: NodeUtilsService
  ) {}

  async getNavigationConfig(
    childrenByEntity: Record<string, LuigiNode[]>,
    envConfig: ClientEnvironment
  ) {
    const allNodes = Object.values(childrenByEntity).reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );

    const portalConfig = await this.configService.getPortalConfig();
    this.luigiCoreService.setFeatureToggles(portalConfig.featureToggles);
    const luigiNodes = await this.nodesFn(
      childrenByEntity,
      portalConfig,
      envConfig
    );

    return {
      nodes: luigiNodes,
      viewGroupSettings: this.buildViewGroups(allNodes),
      appSwitcher: this.appSwitcherConfigService.getAppSwitcher(luigiNodes),
      globalContext:
        this.navigationGlobalContextConfigService.getGlobalContext(),
      profile: await this.userProfileConfigService.getProfile(),
      addNavHrefs: true,
      contextSwitcher: undefined,
      nodeAccessibilityResolver: this.luigiNodesService.nodePolicyResolver,
      validWebcomponentUrls: envConfig.validWebcomponentUrls,
      intentMapping: this.intentNavigationService.buildIntentMappings(allNodes),
      nodeChangeHook: function (prevNode, nextNode) {
        this.nodeChangeHookConfigService.nodeChangeHook(
          prevNode,
          nextNode,
          this.ctx
        );
      }.bind(this),
      breadcrumbs: this.luigiBreadcrumbConfigService.getBreadcrumbsConfig(),
    };
  }

  private buildViewGroups(nodes: LuigiNode[]) {
    const viewGroups = {};
    nodes.forEach((node) => {
      if (node.viewGroup && node._preloadUrl) {
        viewGroups[node.viewGroup] = {
          preloadUrl: node._preloadUrl,
          requiredIFramePermissions:
            node._requiredIFramePermissionsForViewGroup,
        };
      }
    });

    return viewGroups;
  }

  private async nodesFn(
    childrenByEntity: Record<string, LuigiNode[]>,
    portalConfig: PortalConfig,
    envConfig?: ClientEnvironment
  ) {
    const globalNodes = [
      ...(childrenByEntity['global'] || []),
      ...(childrenByEntity['global.bottom'] || []),
      ...(childrenByEntity['global.topnav'] || []),
      ...(await this.customGlobalNodesService.getCustomGlobalNodes(this.ctx)),
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
      child.onNodeActivation = this.nodeUtilsService.retrieveHelpContext(
        this.ctx
      );
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

    addToAll('tenant', ctx.tenantid);
    addToAll('user', ctx.userid);

    return contextForEntityConfig;
  }
}

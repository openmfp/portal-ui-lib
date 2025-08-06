import { Inject, Injectable, Optional } from '@angular/core';
import {
  LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN,
  LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN,
  LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { ClientEnvironment, LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNodesService } from '../luigi-nodes/luigi-nodes.service';
import { NodesProcessingService } from '../luigi-nodes/nodes-processing.service';
import { ConfigService } from '../portal';
import { AppSwitcherConfigService } from './app-switcher-config.service';
import { IntentNavigationService } from '../luigi-nodes/intent-navigation.service';
import { LuigiBreadcrumbConfigService } from './luigi-breadcrumb-config.service';
import { NavigationGlobalContextConfigService } from './navigation-global-context-config.service';
import { NodeChangeHookConfigService } from './node-change-hook-config.service';
import { UserProfileConfigService } from './user-profile-config.service';

@Injectable({ providedIn: 'root' })
export class NavigationConfigService {
  constructor(
    private configService: ConfigService,
    private luigiCoreService: LuigiCoreService,
    private luigiNodesService: LuigiNodesService,
    private intentNavigationService: IntentNavigationService,
    private navigationGlobalContextConfigService: NavigationGlobalContextConfigService,
    @Optional()
    @Inject(LUIGI_BREADCRUMB_CONFIG_SERVICE_INJECTION_TOKEN)
    private luigiBreadcrumbConfigService: LuigiBreadcrumbConfigService,
    @Optional()
    @Inject(LUIGI_USER_PROFILE_CONFIG_SERVICE_INJECTION_TOKEN)
    private userProfileConfigService: UserProfileConfigService,
    @Optional()
    @Inject(LUIGI_APP_SWITCHER_CONFIG_SERVICE_INJECTION_TOKEN)
    private appSwitcherConfigService: AppSwitcherConfigService,
    @Optional()
    @Inject(LUIGI_NODE_CHANGE_HOOK_SERVICE_INJECTION_TOKEN)
    private nodeChangeHookConfigService: NodeChangeHookConfigService,
    private nodesProcessingService: NodesProcessingService
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
    const context = await this.navigationGlobalContextConfigService.getGlobalContext();
    const luigiNodes =
      await this.nodesProcessingService.processNodes(childrenByEntity);

    return {
      nodes: luigiNodes,
      viewGroupSettings: this.buildViewGroups(allNodes),
      appSwitcher: this.appSwitcherConfigService?.getAppSwitcher(luigiNodes),
      globalContext: context,
      profile: await this.userProfileConfigService?.getProfile(),
      addNavHrefs: true,
      contextSwitcher: undefined,
      nodeAccessibilityResolver: this.luigiNodesService.nodePolicyResolver,
      validWebcomponentUrls: envConfig.validWebcomponentUrls,
      intentMapping: this.intentNavigationService.buildIntentMappings(allNodes),
      nodeChangeHook: function (prevNode, nextNode) {
        this.nodeChangeHookConfigService?.nodeChangeHook(prevNode, nextNode);
      }.bind(this),
      breadcrumbs:
        await this.luigiBreadcrumbConfigService?.getBreadcrumbsConfig(),
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
}

import { inject, Injectable } from '@angular/core';
import { EntityType } from '../../models/entity';
import { I18nService } from '../i18n.service';
import { ConfigService } from '../portal';
import {
  EntityConfig,
  EntityDefinition,
  ErrorComponentConfig,
  LuigiNode,
  PortalConfig,
  ServiceProvider,
} from '../../models';
import {
  ERROR_COMPONENT_CONFIG,
  LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN,
} from '../../injection-tokens';
import { LocalConfigurationService } from './local-configuration.service';

@Injectable({
  providedIn: 'root',
})
export class LuigiNodesService {
  private i18nService = inject(I18nService);
  private configService = inject(ConfigService);
  private errorComponentConfig = inject<Record<string, ErrorComponentConfig>>(
    ERROR_COMPONENT_CONFIG as any,
    {
      optional: true,
    }
  );
  private localConfigurationService = inject<LocalConfigurationService>(
    LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN as any
  );

  private getChildrenByEntity(
    allChildren: LuigiNode[]
  ): Record<string, LuigiNode[]> {
    const childrenByEntity = {
      home: [],
    };
    for (const child of allChildren) {
      // default to home to stay backward compatible
      const entityType = child.entityType || 'home';

      if (!childrenByEntity[entityType]) {
        childrenByEntity[entityType] = [];
      }

      childrenByEntity[entityType].push(child);
    }

    return childrenByEntity;
  }

  public async replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[]
  ): Promise<LuigiNode[]> {
    return await this.localConfigurationService.replaceServerNodesWithLocalOnes(
      serverLuigiNodes,
      currentEntities
    );
  }

  async retrieveChildrenByEntity(): Promise<Record<string, LuigiNode[]>> {
    const rawNodes = await this.retrieveAndMergeNodes();
    return this.getChildrenByEntity(rawNodes);
  }

  async retrieveAndMergeEntityChildren(
    entityDefinition: EntityDefinition,
    existingChildren: LuigiNode[],
    parentEntityPath: string,
    additionalContext?: Record<string, string>
  ): Promise<LuigiNode[]> {
    let errorCode = 0;
    let configsForEntity: EntityConfig;
    const entityType = entityDefinition.dynamicFetchId;
    try {
      configsForEntity = await this.configService.getEntityConfig(
        entityType,
        additionalContext
      );
    } catch (e) {
      errorCode = e.status || 500;
      console.warn(
        `Could not retrieve nodes for entity: ${entityType}, error: `,
        e
      );
    }

    if (errorCode) {
      return this.createErrorNodes(
        entityDefinition,
        additionalContext,
        errorCode
      );
    }

    const serverLuigiNodes = this.extractServerLuigiNodes(
      configsForEntity.providers
    );
    const rawEntityNodes = await this.replaceServerNodesWithLocalOnes(
      serverLuigiNodes,
      [parentEntityPath]
    );
    return [...(existingChildren || []), ...(rawEntityNodes || [])];
  }

  private createErrorNodes(
    entityDefinition: EntityDefinition,
    additionalContext: Record<string, string>,
    errorCode: number
  ): LuigiNode[] {
    return [
      {
        pathSegment: 'error',
        entityType: EntityType.ENTITY_ERROR,
        hideFromNav: true,
        hideSideNav: true,
        viewUrl: `/assets/openmfp-portal-ui-wc.js#error-component`,
        context: {
          error: {
            code: errorCode,
            errorComponentConfig: this.errorComponentConfig,
            entityDefinition,
            additionalContext,
          },
          translationTable: this.i18nService.translationTable,
        },
        isolateView: true,
        showBreadcrumbs: false,
        webcomponent: {
          selfRegistered: true,
        },
      },
    ];
  }

  nodePolicyResolver(nodeToCheckPermissionFor): boolean {
    const mockPermissions = ['projectMember'];
    const permissions = nodeToCheckPermissionFor.requiredPolicies;
    return (
      !permissions ||
      permissions.every((item) => mockPermissions.includes(item))
    );
  }

  clearNodeCache(): void {
    this.configService.clearEntityConfigCache();
  }

  private async retrieveAndMergeNodes(): Promise<LuigiNode[]> {
    let portalConfig: PortalConfig;
    try {
      portalConfig = await this.configService.getPortalConfig();
    } catch (e) {
      console.warn('Could not retrieve nodes, error: ', e);
      throw e;
    }

    const serverLuigiNodes = this.extractServerLuigiNodes(
      portalConfig.providers
    );

    return this.replaceServerNodesWithLocalOnes(serverLuigiNodes, [
      'global',
      'home',
    ]);
  }

  private shouldShowNewBadge(serviceProvider: ServiceProvider): boolean {
    if (
      serviceProvider.isMandatoryExtension ||
      !serviceProvider.creationTimestamp
    ) {
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return !(
      new Date(serviceProvider.creationTimestamp).getTime() <
      yesterday.getTime()
    );
  }

  private extractServerLuigiNodes(
    serviceProviders: ServiceProvider[]
  ): LuigiNode[] {
    let serverLuigiNodes: LuigiNode[] = [];
    serviceProviders.forEach((serviceProvider) => {
      const shouldShowNewBadge = this.shouldShowNewBadge(serviceProvider);
      serviceProvider.nodes.forEach((node) => {
        if (shouldShowNewBadge) {
          node.statusBadge = { label: 'New', type: 'informative' };
        }
        node.context = node.context || {};
        node.context.serviceProviderConfig = {
          ...serviceProvider.config,
          ...serviceProvider.installationData,
        };
      });
      serverLuigiNodes = serverLuigiNodes.concat(serviceProvider.nodes);
    });
    return serverLuigiNodes;
  }
}

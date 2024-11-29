import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceProviderService } from '../portal';
import { EntityDefinition, LuigiNode, ServiceProvider } from '../../models';
import { LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LocalConfigurationService } from './local-configuration.service';

@Injectable({
  providedIn: 'root',
})
export class LuigiNodesService {
  constructor(
    private serviceProviderService: ServiceProviderService,
    @Inject(LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN)
    private localConfigurationService: LocalConfigurationService
  ) {}

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
    let configsForEntity;
    const entityType = entityDefinition.dynamicFetchId;
    try {
      configsForEntity =
        await this.serviceProviderService.getRawConfigsForEntity(
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

    const serverLuigiNodes = this.extractServerLuigiNodes(configsForEntity);
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
    const errorNode = {
      pathSegment: ':notfound',
      entityType: 'ERROR_NOT_FOUND',
      hideFromNav: true,
      hideSideNav: true,
      viewUrl: `/error-handling#entity_${errorCode}`,
      context: {
        error: {
          entityDefinition,
          additionalContext,
        },
      },
      isolateView: true,
      loadingIndicator: { enabled: false },
      showBreadcrumbs: false,
      virtualTree: true,
    };
    return [errorNode];
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
    this.serviceProviderService.clearCache();
  }

  private async retrieveAndMergeNodes(): Promise<LuigiNode[]> {
    const rawConfigsPromise = this.serviceProviderService
      .getRawConfigs()
      .catch((e) => {
        console.warn('Could not retrieve nodes, error: ', e);
        throw e;
      });

    const serverLuigiNodes = this.extractServerLuigiNodes(
      await rawConfigsPromise
    );

    return this.replaceServerNodesWithLocalOnes(serverLuigiNodes, [
      'global',
      'home',
    ]);
  }

  private shouldShowNewBadge(serviceProvider: ServiceProvider): boolean {
    if (serviceProvider.isMandatoryExtension) {
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
    serviceProviders: ServiceProvider[] | undefined
  ): LuigiNode[] {
    let serverLuigiNodes: LuigiNode[] = [];
    serviceProviders?.forEach((serviceProvider) => {
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

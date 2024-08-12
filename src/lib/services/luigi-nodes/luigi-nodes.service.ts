import { Inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceProviderService } from '../portal/service-provider.service';
import { LocalNodesService } from './local-nodes.service';
import { EntityDefinition, LuigiNode } from '../../models/luigi';
import { LOCAL_NODES_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { ServiceProvider } from '../../models/portal';

@Injectable({
  providedIn: 'root',
})
export class LuigiNodesService {
  constructor(
    private serviceProviderService: ServiceProviderService,
    @Inject(LOCAL_NODES_SERVICE_INJECTION_TOKEN)
    private localNodesService: LocalNodesService
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
    return await this.localNodesService.replaceServerNodesWithLocalOnes(
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
    const entityType = entityDefinition.dynamicFetchId;
    const configsForEntity = this.serviceProviderService
      .getRawConfigsForEntity(entityType, additionalContext)
      .catch((e) => {
        if (e instanceof HttpErrorResponse && e.status === 404) {
          errorCode = 404;
        } else {
          console.warn(
            'Could not retrieve nodes for entity ' + entityType + ', error: ',
            e
          );
        }
        return [];
      });

    const serverLuigiNodes = this.extractServerLuigiNodes(
      await configsForEntity
    );

    const rawEntityNodes = await this.replaceServerNodesWithLocalOnes(
      serverLuigiNodes,
      [parentEntityPath]
    );

    if (errorCode > 0) {
      return this.createErrorNodes(
        entityDefinition,
        additionalContext,
        errorCode
      );
    }

    const allEntityNodes = [
      ...(existingChildren || []),
      ...(rawEntityNodes || []),
    ];
    return allEntityNodes;
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
    return [
      {
        ...errorNode,
        ...{ pathSegment: 'error' },
      },
      errorNode,
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
    this.serviceProviderService.clearCache();
  }

  private async retrieveAndMergeNodes(): Promise<LuigiNode[]> {
    const rawConfigsPromise = this.serviceProviderService
      .getRawConfigsForTenant()
      .catch((e) => {
        console.warn('Could not retrieve tenant nodes, error: ', e);
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

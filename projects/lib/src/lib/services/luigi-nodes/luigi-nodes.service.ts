import { ERROR_COMPONENT_CONFIG } from '../../injection-tokens';
import {
  EntityConfig,
  EntityDefinition,
  EntityType,
  ErrorComponentConfig,
  LuigiNode,
  NodeContext,
} from '../../models';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { ConfigService } from '../portal';
import { LocalConfigurationServiceImpl } from './local-configuration.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LuigiNodesService {
  private i18nService = inject(I18nService);
  private configService = inject(ConfigService);
  private luigiCoreService = inject(LuigiCoreService);
  private localConfigurationService = inject(LocalConfigurationServiceImpl);
  private errorComponentConfig = inject<Record<string, ErrorComponentConfig>>(
    ERROR_COMPONENT_CONFIG as any,
    {
      optional: true,
    },
  );

  private getChildrenByEntity(
    allChildren: LuigiNode[],
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

  async retrieveChildrenByEntity(): Promise<Record<string, LuigiNode[]>> {
    try {
      const portalConfig = await this.configService.getPortalConfig();
      const serverLuigiNodes: LuigiNode[] = portalConfig.providers.flatMap(
        (p) => p.nodes,
      );
      const luigiNodes =
        await this.localConfigurationService.replaceServerNodesWithLocalOnes(
          serverLuigiNodes,
          ['global', 'main', 'home'],
        );
      return this.getChildrenByEntity(luigiNodes);
    } catch (e) {
      console.warn('Could not retrieve nodes, error: ', e);
      throw e;
    }
  }

  async retrieveEntityChildren(
    entityDefinition: EntityDefinition,
    additionalContext?: Record<string, string>,
  ): Promise<LuigiNode[]> {
    let errorCode = 0;
    let configsForEntity: EntityConfig;
    const entityType = entityDefinition.dynamicFetchId;

    try {
      if (!entityType) {
        throw new Error('Entity type is required');
      }

      configsForEntity = await this.configService.getEntityConfig(
        entityType,
        additionalContext,
      );

      return configsForEntity.providers.flatMap((p) => p.nodes);
    } catch (e) {
      errorCode = e.status || 500;
      console.warn(
        `Could not retrieve nodes for entity: ${entityType}, error: `,
        e,
      );

      return this.createErrorNodes(
        entityDefinition,
        errorCode,
        additionalContext,
      );
    }
  }

  private createErrorNodes(
    entityDefinition: EntityDefinition,
    errorCode: number,
    additionalContext?: Record<string, string>,
  ): LuigiNode[] {
    return [
      {
        pathSegment: 'error',
        entityType: EntityType.ENTITY_ERROR,
        hideFromNav: true,
        hideSideNav: true,
        viewUrl: '/assets/openmfp-portal-ui-wc.js#error-component',
        context: {
          error: {
            code: errorCode,
            errorComponentConfig: this.errorComponentConfig,
            entityDefinition,
            additionalContext,
          },
          translationTable: this.i18nService.translationTable,
        } as NodeContext,
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
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@angular/core';
import { merge } from 'lodash';
import { LocalNodesService } from './local-nodes.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LuigiNode } from '../../models';
import { DevModeSettings } from './dev-mode/dev-mode-settings';
import { DevModeSettingsService } from './dev-mode/dev-mode-settings.service';
import { LUIGI_DATA_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiDataConfigService } from './luigi-data-config.service';

@Injectable({
  providedIn: 'root',
})
export class LocalConfigurationService implements LocalNodesService {
  constructor(
    @Inject(LUIGI_DATA_CONFIG_SERVICE_INJECTION_TOKEN)
    private luigiDataConfigService: LuigiDataConfigService,
    private luigiCoreService: LuigiCoreService,
    private devModeSettingsService: DevModeSettingsService,
  ) {}

  public async getLocalNodes(): Promise<LuigiNode[]> {
    const language = this.luigiCoreService.i18n().getCurrentLocale();

    try {
      const devModeSettings =
        await this.devModeSettingsService.getDevModeSettings();
      const nodes =
        await this.luigiDataConfigService.getLuigiDataFromConfigurations(
          devModeSettings.configs,
          language,
        );

      nodes.forEach((node) => {
        node.context = node.context || {};
        node.context.serviceProviderConfig =
          devModeSettings.serviceProviderConfig;
      });
      return nodes;
    } catch (e) {
      console.warn(`failed to retrieve local luigi config`, e);
      return [];
    }
  }

  public async getNodesFromCdm(
    devModeCdmSettings: DevModeSettings,
    language: any,
  ) {
    return await this.luigiDataConfigService.getLuigiDataFromConfigurations(
      devModeCdmSettings.configs,
      language,
    );
  }

  public async replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[],
  ): Promise<LuigiNode[]> {
    console.debug(
      `Processing local nodes for the entities ${currentEntities.join(',')}`,
    );
    const localNodes = await this.getLocalNodes();

    if (localNodes.length == 0) {
      return serverLuigiNodes;
    }

    const localLuigiNodes = this.extendContextOfLocalNodes(
      localNodes,
      serverLuigiNodes,
    );

    console.debug(
      `Found '${serverLuigiNodes.length}' server nodes. Found '${
        localLuigiNodes.length
      }' local luigi nodes. The entities of the server node are:${[
        ...new Set(
          serverLuigiNodes.map((n) =>
            this.stripCompoundFromEntity(n.entityType),
          ),
        ),
      ].join(',')}
      The entities of local nodes are: ${[
        ...new Set(
          localLuigiNodes.map((n) =>
            this.stripCompoundFromEntity(n.entityType),
          ),
        ),
      ].join(',')}`,
    );

    const filteredServerNodes = serverLuigiNodes.filter(
      (node) =>
        !localLuigiNodes.some((localNode) =>
          this.localNodeMatchesServerNode(localNode, node),
        ),
    );

    console.debug(
      `${filteredServerNodes.length} server nodes have no matching local nodes`,
    );

    const nodesToAdd = localLuigiNodes.filter((n) => {
      let entity = this.stripCompoundFromEntity(n.entityType);
      entity = entity || 'home';
      return currentEntities.includes(entity);
    });

    if (!nodesToAdd.length) {
      console.debug(
        `Found no local nodes for the entities: ${currentEntities.join(',')}`,
      );
      return filteredServerNodes;
    }

    console.debug(
      `Added ${
        nodesToAdd.length
      } local nodes to the luigi config for ${currentEntities.join(',')}`,
    );
    return filteredServerNodes.concat(nodesToAdd);
  }

  private stripCompoundFromEntity(entity: string): string {
    if (!entity) {
      return entity;
    }

    // also strip the first segemnt of the entity, to get the actual entity.
    // then strip ::.* for the root compound views
    return entity.replace(/\..*::.*/, '').replace(/::.*/, '');
  }

  private extendContextOfLocalNodes(
    localLuigiNodes: LuigiNode[],
    serverLuigiNodes: LuigiNode[],
  ): LuigiNode[] {
    localLuigiNodes.forEach((localNode) => {
      const matchingServerNode = serverLuigiNodes.find((serverNode) =>
        this.localNodeMatchesServerNode(localNode, serverNode),
      );
      if (matchingServerNode && matchingServerNode.context) {
        localNode.context = merge(
          {},
          matchingServerNode.context,
          localNode.context,
        );
      }
    });
    return localLuigiNodes;
  }

  private localNodeMatchesServerNode(
    localNode: LuigiNode,
    node: LuigiNode,
  ): boolean {
    return (
      localNode.pathSegment === node.pathSegment &&
      localNode.entityType === node.entityType
    );
  }
}

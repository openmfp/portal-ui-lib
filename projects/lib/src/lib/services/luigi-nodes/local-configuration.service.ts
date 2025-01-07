import { inject, Injectable } from '@angular/core';
import { merge } from 'lodash';
import {
  ContentConfiguration,
  LuigiNode,
  LocalDevelopmentSettings,
} from '../../models';
import { LocalDevelopmentSettingsLocalStorage } from '../storage-service';
import { LocalNodesConfigService } from '../portal';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface LocalConfigurationService {
  replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[]
  ): Promise<LuigiNode[]>;
  getLocalNodes(): Promise<LuigiNode[]>;
}

@Injectable({
  providedIn: 'root',
})
export class LocalConfigurationServiceImpl
  implements LocalConfigurationService
{
  private http = inject(HttpClient);
  private luigiConfigService = inject(LocalNodesConfigService);
  private cachedConfigurations: ContentConfiguration[];

  public async getLocalNodes(): Promise<LuigiNode[]> {
    const localDevelopmentSettings =
      LocalDevelopmentSettingsLocalStorage.read();

    if (!localDevelopmentSettings?.isActive) {
      return [];
    }

    try {
      const configurations = await this.getLocalConfigurations(
        localDevelopmentSettings
      );
      const luigiNodes =
        await this.luigiConfigService.getLuigiNodesFromConfigurations(
          configurations
        );

      (luigiNodes || []).forEach((node) => {
        node.context = {
          ...node.context,
          serviceProviderConfig: localDevelopmentSettings.serviceProviderConfig,
        };
      });

      return luigiNodes;
    } catch (e) {
      console.warn(`Failed to retrieve local luigi config.`, e);
      return [];
    }
  }

  public async replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[]
  ): Promise<LuigiNode[]> {
    console.debug(
      `Processing local nodes for the entities ${currentEntities.join(',')}`
    );
    const localNodes = await this.getLocalNodes();

    if (!localNodes || localNodes.length == 0) {
      return serverLuigiNodes;
    }

    const localLuigiNodes = this.extendContextOfLocalNodes(
      localNodes,
      serverLuigiNodes
    );

    console.debug(
      `Found '${serverLuigiNodes.length}' server nodes. Found '${
        localLuigiNodes.length
      }' local luigi nodes. The entities of the server node are:${[
        ...new Set(
          serverLuigiNodes.map((n) =>
            this.stripCompoundFromEntity(n.entityType)
          )
        ),
      ].join(',')}
      The entities of local nodes are: ${[
        ...new Set(
          localLuigiNodes.map((n) => this.stripCompoundFromEntity(n.entityType))
        ),
      ].join(',')}`
    );

    const filteredServerNodes = serverLuigiNodes.filter(
      (node) =>
        !localLuigiNodes.some((localNode) =>
          this.localNodeMatchesServerNode(localNode, node)
        )
    );

    console.debug(
      `${filteredServerNodes.length} server nodes have no matching local nodes`
    );

    const nodesToAdd = localLuigiNodes.filter((n) => {
      let entity = this.stripCompoundFromEntity(n.entityType);
      entity = entity || 'home';
      return currentEntities.includes(entity);
    });

    if (!nodesToAdd.length) {
      console.debug(
        `Found no local nodes for the entities: ${currentEntities.join(',')}`
      );
      return filteredServerNodes;
    }

    console.debug(
      `Added ${
        nodesToAdd.length
      } local nodes to the luigi config for ${currentEntities.join(',')}`
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
    serverLuigiNodes: LuigiNode[]
  ): LuigiNode[] {
    localLuigiNodes.forEach((localNode) => {
      const matchingServerNode = serverLuigiNodes.find((serverNode) =>
        this.localNodeMatchesServerNode(localNode, serverNode)
      );
      if (matchingServerNode && matchingServerNode.context) {
        localNode.context = merge(
          {},
          matchingServerNode.context,
          localNode.context
        );
      }
    });
    return localLuigiNodes;
  }

  private localNodeMatchesServerNode(
    localNode: LuigiNode,
    node: LuigiNode
  ): boolean {
    return (
      localNode.pathSegment === node.pathSegment &&
      localNode.entityType === node.entityType
    );
  }

  private async getLocalConfigurations(
    localDevelopmentSettings: LocalDevelopmentSettings
  ): Promise<ContentConfiguration[]> {
    if (this.cachedConfigurations) {
      return this.cachedConfigurations;
    }

    this.cachedConfigurations = localDevelopmentSettings.configs
      .filter((config) => config.data)
      .map((config) => config.data);

    this.cachedConfigurations = (
      await Promise.allSettled(
        localDevelopmentSettings.configs
          .filter((config) => config.url)
          .map((config) =>
            lastValueFrom(this.http.get<ContentConfiguration>(config.url)).then(
              (contentConfiguration: ContentConfiguration) =>
                ({
                  ...contentConfiguration,
                  devUrl: config.url,
                }) as ContentConfiguration
            )
          )
      )
    )
      .filter(
        (result): result is PromiseFulfilledResult<ContentConfiguration> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value)
      .concat(this.cachedConfigurations);

    return this.cachedConfigurations;
  }
}

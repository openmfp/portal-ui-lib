import { inject, Injectable } from '@angular/core';
import { DialogService } from '@fundamental-ngx/core/dialog';
import { merge } from 'lodash';
import {
  ContentConfiguration,
  LuigiNode,
  LocalDevelopmentSettings,
} from '../../models';
import { ValidationResult } from '../../models/node-transform';
import { LuigiCoreService } from '../luigi-core.service';
import { localDevelopmentSettingsLocalStorage } from '../storage-service';
import { LocalNodesService } from '../portal';
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
  private luigiConfigService = inject(LocalNodesService);
  private luigiCoreService = inject(LuigiCoreService);
  private dialogService = inject(DialogService);
  private cachedLocalNodes: LuigiNode[];

  public async getLocalNodes(): Promise<LuigiNode[]> {
    const localDevelopmentSettings =
      localDevelopmentSettingsLocalStorage.read();

    if (!localDevelopmentSettings?.isActive) {
      return [];
    }

    if (this.cachedLocalNodes) {
      return this.cachedLocalNodes;
    }

    try {
      const configurations = await this.getLocalConfigurations(
        localDevelopmentSettings
      );
      const result =
        (await this.luigiConfigService.getLuigiNodesFromConfigurations(
          configurations
        )) || {};

      if (result.errors) {
        this.alertErrors(result.errors);
      }

      (result.nodes || []).forEach((node) => {
        node.context = {
          ...node.context,
          serviceProviderConfig: localDevelopmentSettings.serviceProviderConfig,
        };
      });

      return (this.cachedLocalNodes = result.nodes || []);
    } catch (e) {
      console.warn(`Failed to retrieve local luigi config.`, e);
      return [];
    }
  }

  private alertErrors(errors: ValidationResult[]) {
    const message = errors
      .map((e) => {
        return `For configuration with url:
            ${e.url} <br/><br/>
            ${(e.validationErrors || [])
              .map((v) => v.message)
              .slice(0, -1)
              .join('<br/>')}`;
      })
      .join('<br/><br/><br/>');
    this.luigiCoreService.showAlert({
      text: `
            Your local development configuration contains error(s).
            You will not be able to see you local changes and local development results unless you correct the data and reload the page. 
            Please see below the detailed information: <br/><br/>
            
            ${message}
          `,
      type: 'error',
    });
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
      `Found '${serverLuigiNodes.length}' server nodes. 
       Found '${localLuigiNodes.length}' local luigi nodes. 
       The entities of the server node are: [${[
         ...new Set(serverLuigiNodes.map((n) => n.entityType)),
       ].join(',')}]
      The entities of local nodes are: [${[
        ...new Set(localLuigiNodes.map((n) => n.entityType)),
      ].join(',')}]`
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
      const entity = n.entityType?.includes('::compound')
        ? 'global'
        : n.entityType || 'home';
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
    const initialConfigurations = localDevelopmentSettings.configs
      .filter((config) => config.data)
      .map((config) => config.data);

    const configurations = (
      await Promise.allSettled(
        localDevelopmentSettings.configs
          .filter((config) => config.url)
          .map((config) =>
            lastValueFrom(this.http.get<ContentConfiguration>(config.url)).then(
              (contentConfiguration: ContentConfiguration) =>
                ({
                  ...contentConfiguration,
                  url: config.url,
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
      .concat(initialConfigurations);

    return configurations;
  }
}

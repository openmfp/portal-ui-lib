import { LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import {
  ContentConfiguration,
  LocalDevelopmentSettings,
  LuigiNode,
} from '../../models';
import { ValidationResult } from '../../models/node-transform';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { LocalNodesService } from '../portal';
import { localDevelopmentSettingsLocalStorage } from '../storage-service';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface LocalConfigurationService {
  getLocalNodes(): Promise<LuigiNode[]>;
}

@Injectable({
  providedIn: 'root',
})
export class LocalConfigurationServiceImpl {
  private http = inject(HttpClient);
  private luigiConfigService = inject(LocalNodesService);
  private i18nService = inject(I18nService);
  private luigiCoreService = inject(LuigiCoreService);
  private customLocalConfigurationService = inject<LocalConfigurationService>(
    LOCAL_CONFIGURATION_SERVICE_INJECTION_TOKEN as any,
    { optional: true },
  );
  private cachedLocalNodes: LuigiNode[];

  public async getLocalNodes(): Promise<LuigiNode[]> {
    const localDevelopmentSettings =
      localDevelopmentSettingsLocalStorage.read();

    if (!localDevelopmentSettings?.isActive) {
      return (
        (await this.customLocalConfigurationService?.getLocalNodes()) || []
      );
    }

    this.addLocalDevelopmentModeOnIndicator();

    if (this.cachedLocalNodes?.length) {
      return this.cachedLocalNodes;
    }

    try {
      const configurations = await this.getLocalConfigurations(
        localDevelopmentSettings,
      );
      const result =
        (await this.luigiConfigService.getLuigiNodesFromConfigurations(
          configurations,
        )) || {};

      if (result.errors) {
        this.alertErrors(result.errors);
      }

      (result.nodes || []).forEach((node) => {
        if (!node.context) {
          this.luigiCoreService.showAlert({
            text: `Node context is missing for node ${JSON.stringify(node)}`,
            type: 'error',
          });

          return;
        }

        node.context = {
          ...node.context,
          serviceProviderConfig: {
            ...node.context?.serviceProviderConfig,
            ...localDevelopmentSettings.serviceProviderConfig,
          },
        };
      });

      return (this.cachedLocalNodes = result.nodes || []);
    } catch (e) {
      console.warn(`Failed to retrieve local luigi config.`, e);
      return [];
    }
  }

  addLocalDevelopmentModeOnIndicator() {
    const popoverControl = document.querySelector('#profilePopover');

    if (popoverControl && popoverControl.parentNode) {
      const newSpan = document.createElement('span');
      newSpan.classList.add(
        'sap-icon--developer-settings',
        'local-development-settings-indication',
      );
      newSpan.title = this.i18nService.getTranslation(
        'LOCAL_DEVELOPMENT_SETTINGS_ACTIVE_INDICATOR',
      );
      popoverControl.parentNode.appendChild(newSpan);
    }
  }

  private alertErrors(errors: ValidationResult[]) {
    const message = errors
      .map((e) => {
        return `For configuration with url:
            ${e.url} <br/><br/>
            ${(e.validationErrors || [])
              .map((v) => v.message)
              .filter((v) => !v.includes('The document is not valid'))
              .join('<br/>')}`;
      })
      .join('<br/><br/><br/>');
    this.luigiCoreService.showAlert({
      text: `
            Your local development configuration contains error(s).
            You will not be able to see your local changes and local development results unless you correct the data and reload the page.
            Please see below the detailed information: <br/><br/>

            ${message}
          `,
      type: 'error',
    });
  }

  public async replaceServerNodesWithLocalOnes(
    serverLuigiNodes: LuigiNode[],
    currentEntities: string[],
  ): Promise<LuigiNode[]> {
    const localNodes = await this.getLocalNodes();
    console.debug(
      `Processing local nodes for currentEntities: ${currentEntities}`,
    );
    if (!localNodes || localNodes.length == 0) {
      console.debug('No local nodes found');
      return serverLuigiNodes;
    }
    this.logNodesState(serverLuigiNodes, localNodes);

    const localReplacingNodes: LuigiNode[] = [];
    const filteredServerNodes = serverLuigiNodes.filter((serverNode) => {
      const index = localNodes.findIndex((localNode) => {
        return this.localNodeMatchesServerNode(localNode, serverNode);
      });
      if (index !== -1) {
        const [localFoundNode] = localNodes.splice(index, 1);
        localReplacingNodes.push(localFoundNode);

        if (!localFoundNode.context) {
          this.luigiCoreService.showAlert({
            text: `Local node context is missing for node ${JSON.stringify(localFoundNode)}`,
            type: 'error',
          });

          throw new Error(
            `Local node context is missing for node ${JSON.stringify(localFoundNode)}`,
          );
        }

        localFoundNode.context = {
          ...serverNode.context,
          ...localFoundNode.context,
        };
      }
      return index === -1;
    });

    const localNewNodes = localNodes.filter((n) => {
      const entity = n.entityType?.includes('::compound')
        ? 'global'
        : n.entityType || 'home';
      return currentEntities.includes(entity);
    });

    console.debug(
      `${filteredServerNodes.length} server nodes have no matching local nodes.
      Found ${localReplacingNodes.length} matching local nodes.
      Adding ${localNewNodes.length} new local nodes.`,
    );

    return filteredServerNodes
      .concat(localReplacingNodes)
      .concat(localNewNodes);
  }

  private logNodesState(
    serverLuigiNodes: LuigiNode[],
    localNodes: LuigiNode[],
  ) {
    const serverEntityTypes = [
      ...new Set(serverLuigiNodes.map((n) => n.entityType)),
    ]
      .filter(Boolean)
      .join(',');

    const localEntityTypes = [...new Set(localNodes.map((n) => n.entityType))]
      .filter(Boolean)
      .join(',');
    console.debug(
      `Found '${serverLuigiNodes.length}' server nodes.
       Found '${localNodes.length}' local luigi nodes.
       The entities of the server node are: [${serverEntityTypes}]
       The entities of local nodes are: [${localEntityTypes}]`,
    );
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

  private async getLocalConfigurations(
    localDevelopmentSettings: LocalDevelopmentSettings,
  ): Promise<ContentConfiguration[]> {
    const initialConfigurations: ContentConfiguration[] =
      localDevelopmentSettings.configs
        .filter(
          (config): config is { data: ContentConfiguration } => !!config.data,
        )
        .map((config) => config.data);

    const configurations = (
      await Promise.allSettled(
        localDevelopmentSettings.configs
          .filter((config): config is { url: string } => !!config.url)
          .map((config) =>
            lastValueFrom(this.http.get<ContentConfiguration>(config.url)).then(
              (contentConfiguration: ContentConfiguration) =>
                ({
                  ...contentConfiguration,
                  url: config.url,
                }) as ContentConfiguration,
            ),
          ),
      )
    )
      .filter(
        (result): result is PromiseFulfilledResult<ContentConfiguration> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value)
      .concat(initialConfigurations);

    return configurations;
  }
}

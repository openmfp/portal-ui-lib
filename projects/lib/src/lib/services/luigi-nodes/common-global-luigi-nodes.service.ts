import {
  ENABLE_GETTING_STARTED_GLOBAL_NODE_INJECTION_TOKEN,
  ERROR_COMPONENT_CONFIG,
} from '../../injection-tokens';
import { ErrorComponentConfig, LuigiNode, NodeContext } from '../../models';
import { EntityType } from '../../models/entity';
import { I18nService } from '../i18n.service';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommonGlobalLuigiNodesService {
  private i18nService = inject(I18nService);
  private errorComponentConfig = inject<Record<string, ErrorComponentConfig>>(
    ERROR_COMPONENT_CONFIG as any,
    {
      optional: true,
    },
  );
  private enableGettingStartedGlobalNode = inject<boolean>(
    ENABLE_GETTING_STARTED_GLOBAL_NODE_INJECTION_TOKEN as any,
    { optional: true },
  );

  public getContentNotFoundGlobalNode(): LuigiNode[] {
    return [
      {
        pathSegment: 'error',
        label: 'Content not found',
        order: '1000',
        hideFromNav: true,
        children: [
          {
            pathSegment: ':id',
            entityType: EntityType.ENTITY_ERROR,
            hideFromNav: true,
            hideSideNav: true,
            viewUrl: '/assets/openmfp-portal-ui-wc.js#error-component',
            context: {
              error: {
                code: 404,
                errorComponentConfig: this.errorComponentConfig,
              },
              translationTable: this.i18nService.translationTable,
            } as NodeContext,
            webcomponent: {
              selfRegistered: true,
            },
          },
        ],
      },
    ];
  }

  public async getGettingStartedGlobalNode(): Promise<LuigiNode[]> {
    if (!this.enableGettingStartedGlobalNode) {
      return [];
    }

    return [
      {
        pathSegment: 'getting-started',
        label: 'Getting Started',
        entityType: EntityType.GLOBAL,
        icon: 'home',
        order: '1',
        hideSideNav: true,
        viewUrl: '/assets/openmfp-portal-ui-wc.js#getting-started',
        webcomponent: {
          selfRegistered: true,
        },
      },
    ];
  }
}

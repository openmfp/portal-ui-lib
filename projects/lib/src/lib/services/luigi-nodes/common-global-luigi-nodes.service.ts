import { inject, Injectable } from '@angular/core';
import { ERROR_COMPONENT_CONFIG } from '../../injection-tokens';
import { ErrorComponentConfig, LuigiNode } from '../../models';
import { EntityType } from '../../models/entity';
import { I18nService } from '../i18n.service';

@Injectable({ providedIn: 'root' })
export class CommonGlobalLuigiNodesService {
  private i18nService = inject(I18nService);
  private errorComponentConfig = inject<Record<string, ErrorComponentConfig>>(
    ERROR_COMPONENT_CONFIG as any,
    {
      optional: true,
    }
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
            },
            webcomponent: {
              selfRegistered: true,
            },
          },
        ],
      },
    ];
  }
}

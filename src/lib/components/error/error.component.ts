import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  ButtonComponent,
  ContentDensityDirective,
  IllustratedMessageComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
} from '@fundamental-ngx/core';
import {
  addInitListener,
  linkManager,
} from '@luigi-project/client/luigi-client';
import { I18nService, LuigiCoreService } from '../../services';

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IllustratedMessageComponent,
    IllustratedMessageTextDirective,
    IllustratedMessageTitleDirective,
    ButtonComponent,
    ContentDensityDirective,
  ],
})
export class ErrorComponent implements AfterViewInit {
  private luigiCoreService = inject(LuigiCoreService);
  private i18nService = inject(I18nService);

  config = {
    sceneConfig: {
      scene: {
        url: '',
        id: '',
      },
    },
    illustratedMessageTitle: '',
    illustratedMessageText: '',
    buttons: [],
  };

  errorCode: string;
  entityNotFoundError: any;
  sceneConfig: any;

  async ngAfterViewInit() {
    this.luigiCoreService.ux().hideAppLoadingIndicator();
    this.i18nService.afterInit();

    this.errorCode = globalThis.location.hash;
    if (this.errorCode) {
      this.errorCode = this.errorCode.replace('#', '');
      if (this.errorCode.includes('/')) {
        this.errorCode = this.errorCode.split('/')[0];
      }
    }
    if (this.errorCode.startsWith('entity_')) {
      addInitListener(async (ctx) => {
        if (ctx.error) {
          this.entityNotFoundError = ctx.error;
        }
        await this.setSceneConfig();
      });
    } else {
      await this.setSceneConfig();
    }
  }

  goTo(button): void {
    if (button.url) {
      window.open(button.url, '_blank');
    } else if (button.route) {
      linkManager().fromContext(button.route.context).navigate('/');
    }
  }

  private async setSceneConfig() {
    if (this.entityNotFoundError) {
      const type = this.entityNotFoundError.entityDefinition?.dynamicFetchId;
      const typeStr = this.entityNotFoundError.entityDefinition?.label;
      const typeStrPlural: string =
        this.entityNotFoundError.entityDefinition?.pluralLabel;

      const sceneId =
        this.entityNotFoundError.entityDefinition?.notFoundConfig
          ?.sapIllusSVG || 'Scene-NoSearchResults';

      const id = this.entityNotFoundError.additionalContext[type];
      const gotoNavContext =
        this.entityNotFoundError.entityDefinition?.notFoundConfig
          ?.entityListNavigationContext;
      const buttons = [];

      if (gotoNavContext && typeStrPlural) {
        buttons.push({
          route: {
            context: gotoNavContext,
          },
          label: await this.i18nService.getTranslationAsync(
            'ERROR_ENTITY_VIEW_ALL_BUTTON',
            { entityTypePlural: typeStrPlural }
          ),
        });
      }

      if (this.errorCode.includes('404')) {
        this.config = await this.getErrorEntityNotFoundConfig(
          id,
          sceneId,
          typeStr,
          typeStrPlural,
          gotoNavContext,
          buttons
        );
      } else if (this.errorCode.includes('403')) {
        this.config = await this.getError403Config();
      } else {
        this.config = await this.getErrorDefaultConfig();
      }
    } else {
      switch (this.errorCode) {
        case '403': {
          this.config = await this.getError403Config();
          break;
        }
        case '404': {
          this.config = await this.getError404Config();
          break;
        }
        default: {
          this.config = await this.getErrorDefaultConfig();
        }
      }
    }
    this.sceneConfig = this.config.sceneConfig;
  }

  private async getError404Config() {
    return {
      sceneConfig: {
        scene: {
          url: 'assets/moments/sapIllus-Scene-NoEntries.svg',
          id: 'sapIllus-Scene-NoEntries',
        },
      },
      illustratedMessageTitle: await this.i18nService.getTranslationAsync(
        'ERROR_CONTENT_NOT_FOUND_TITLE'
      ),
      illustratedMessageText: await this.i18nService.getTranslationAsync(
        'ERROR_CONTENT_NOT_FOUND_TEXT'
      ),
      buttons: [
        {
          url: 'https://jira.tools.sap/secure/CreateIssue.jspa?pid=109355&issuetype=1',
          label: await this.i18nService.getTranslationAsync(
            'ERROR_CONTENT_NOT_FOUND_CREATE_ISSUE_BUTTON'
          ),
        },
      ],
    };
  }

  private async getError403Config() {
    return {
      sceneConfig: {
        scene: {
          url: 'assets/moments/tnt-Scene-UnsuccessfulAuth.svg',
          id: 'tnt-Scene-UnsuccessfulAuth',
        },
      },
      illustratedMessageTitle: '',
      illustratedMessageText: await this.i18nService.getTranslationAsync(
        'ERROR_CONTENT_NOT_ALLOWED_NO_PROJECT_MEMBER_TEXT'
      ),
      buttons: [
        {
          url: '',
          label: await this.i18nService.getTranslationAsync(
            'ERROR_CONTENT_NOT_ALLOWED_JOIN_PROJECT_BUTTON'
          ),
        },
        {
          url: '',
          label: await this.i18nService.getTranslationAsync(
            'ERROR_CONTENT_NOT_ALLOWED_VIEW_PROJECT_BUTTON'
          ),
        },
      ],
    };
  }

  private async getErrorDefaultConfig() {
    return {
      sceneConfig: {
        scene: {
          url: '',
          id: '',
        },
      },
      illustratedMessageTitle: await this.i18nService.getTranslationAsync(
        'ERROR_UNIDENTIFIED_TITLE'
      ),
      illustratedMessageText: '',
      buttons: [],
    };
  }

  private async getErrorEntityNotFoundConfig(
    id: string,
    sceneId: string,
    typeStr: string,
    typeStrPlural: string,
    gotoNavContext: any,
    buttons: any[]
  ) {
    return {
      sceneConfig: {
        scene: {
          url: `assets/moments/sapIllus-${sceneId}.svg`,
          id: `sapIllus-${sceneId}`,
        },
      },
      illustratedMessageTitle: await this.i18nService.getTranslationAsync(
        'ERROR_ENTITY_NOT_FOUND_TITLE',
        { entityType: typeStr, entityId: `<b>${id}</b>` }
      ),
      illustratedMessageText:
        typeStrPlural && gotoNavContext
          ? await this.i18nService.getTranslationAsync(
              'ERROR_ENTITY_NOT_FOUND_TEXT_LIST',
              {
                entityTypePlural: typeStrPlural,
                entityTypePlural_lowerCase: typeStrPlural.toLowerCase(),
              }
            )
          : await this.i18nService.getTranslationAsync(
              'ERROR_ENTITY_NOT_FOUND_TEXT_NO_LIST'
            ),
      buttons,
    };
  }
}

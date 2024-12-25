import {
  Component,
  ViewEncapsulation,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import {
  ButtonComponent,
  ContentDensityDirective,
  IllustratedMessageComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
} from '@fundamental-ngx/core';
import {
  ButtonConfig,
  SceneConfig,
  ErrorComponentConfig,
  EntityDefinition,
  I18nService,
  LuigiCoreService,
} from '@openmfp/portal-ui-lib';

interface ErrorNodeContext {
  error: {
    code: number;
    errorComponentConfig: ErrorComponentConfig;
    entityDefinition: EntityDefinition;
    additionalContext: any;
    translationTable: any;
  };
}

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.component.html',
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
export class ErrorComponent implements OnInit {
  private i18nService = inject(I18nService);
  private luigiCoreService = inject(LuigiCoreService);

  private nodeContext: ErrorNodeContext;

  @Input()
  set context(context: any) {
    this.nodeContext = context;
    this.i18nService.translationTable = context.translationTable;
  }

  config: ErrorComponentConfig = {
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

  sceneConfig: SceneConfig;

  async ngOnInit() {
    await this.setSceneConfig();
  }

  goTo(button: ButtonConfig): void {
    if (button.url) {
      window.open(button.url, '_blank');
    } else if (button.route) {
      this.luigiCoreService.navigation().navigate(`/${button.route.context}`);
    }
  }

  private async setSceneConfig() {
    if (this.nodeContext.error?.entityDefinition) {
      const entityDefinition = this.nodeContext.error.entityDefinition;
      const typeStr = entityDefinition.label;
      const typeStrPlural: string = entityDefinition.pluralLabel;

      const sceneId =
        entityDefinition.notFoundConfig?.sapIllusSVG || 'Scene-NoSearchResults';

      const id = this.nodeContext.error.additionalContext
        ? this.nodeContext.error.additionalContext[
            entityDefinition.dynamicFetchId
          ]
        : '';
      const gotoNavContext =
        entityDefinition.notFoundConfig?.entityListNavigationContext;
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

      if (this.nodeContext.error.code === 404) {
        this.config = await this.getErrorEntity404NotFoundConfig(
          id,
          sceneId,
          typeStr,
          typeStrPlural,
          gotoNavContext,
          buttons
        );
      } else if (this.nodeContext.error.code === 403) {
        this.config = await this.getError403Config();
      } else {
        this.config = await this.getErrorDefaultConfig();
      }
    } else {
      switch (this.nodeContext.error.code) {
        case 403: {
          this.config = await this.getError403Config();
          break;
        }
        case 404: {
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
    const confButtons =
      (this.nodeContext.error.errorComponentConfig || {})['404']?.buttons || [];
    const buttons = [];
    for (let i = 0; i < confButtons.length; i++) {
      buttons.push({
        url: confButtons[i].url,
        label: await this.i18nService.getTranslationAsync(confButtons[i].label),
      });
    }

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
      buttons,
    };
  }

  private async getError403Config() {
    const illustratedMessageText = await this.i18nService.getTranslationAsync(
      'ERROR_CONTENT_NOT_ALLOWED_NO_PROJECT_MEMBER_TEXT'
    );

    return {
      sceneConfig: {
        scene: {
          url: 'assets/moments/tnt-Scene-UnsuccessfulAuth.svg',
          id: 'tnt-Scene-UnsuccessfulAuth',
        },
      },
      illustratedMessageTitle: '',
      illustratedMessageText,
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

  private async getErrorEntity404NotFoundConfig(
    id: string,
    sceneId: string,
    typeStr: string,
    typeStrPlural: string,
    gotoNavContext: any,
    buttons: any[]
  ) {
    const illustratedMessageTitle = await this.i18nService.getTranslationAsync(
      'ERROR_ENTITY_NOT_FOUND_TITLE',
      { entityType: typeStr, entityId: `<b>${id}</b>` }
    );
    const illustratedMessageText =
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
          );

    return {
      sceneConfig: {
        scene: {
          url: `assets/moments/sapIllus-${sceneId}.svg`,
          id: `sapIllus-${sceneId}`,
        },
      },
      illustratedMessageTitle,
      illustratedMessageText,
      buttons,
    };
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, effect, inject, input } from '@angular/core';
import { ButtonConfig, EntityDefinition, ErrorComponentConfig, I18nService, LuigiCoreService, SceneConfig } from '@openmfp/portal-ui-lib';
import '@ui5/webcomponents-fiori/dist/illustrations/NoEntries.js';
import '@ui5/webcomponents-fiori/dist/illustrations/NoSearchResults.js';
import '@ui5/webcomponents-fiori/dist/illustrations/UnableToLoad.js';
import '@ui5/webcomponents-fiori/dist/illustrations/tnt/UnsuccessfulAuth.js';
import { ButtonComponent, IllustratedMessageComponent, TitleComponent } from '@ui5/webcomponents-ngx';


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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IllustratedMessageComponent, ButtonComponent, TitleComponent],
})
export class ErrorComponent implements OnInit {
  private i18nService = inject(I18nService);
  private luigiCoreService = inject(LuigiCoreService);
  private cdr = inject(ChangeDetectorRef);

  public context = input.required<any>();

  constructor() {
    effect(() => {
      this.i18nService.translationTable = this.context().translationTable;
    });
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
    const nodeContext = this.context();
    if (nodeContext.error?.entityDefinition) {
      const entityDefinition = nodeContext.error.entityDefinition;
      const typeStr = entityDefinition.label ?? '';
      const typeStrPlural = entityDefinition.pluralLabel ?? '';

      const sceneId =
        entityDefinition.notFoundConfig?.sapIllusSVG ?? 'Scene-NoSearchResults';

      const id =
        nodeContext.error.additionalContext && entityDefinition.dynamicFetchId
          ? nodeContext.error.additionalContext[entityDefinition.dynamicFetchId]
          : '';
      const gotoNavContext =
        entityDefinition.notFoundConfig?.entityListNavigationContext;
      const buttons: ButtonConfig[] = [];

      if (gotoNavContext && typeStrPlural) {
        buttons.push({
          route: {
            context: gotoNavContext,
          },
          label: await this.i18nService.getTranslationAsync(
            'ERROR_ENTITY_VIEW_ALL_BUTTON',
            { entityTypePlural: typeStrPlural },
          ),
        });
      }

      if (nodeContext.error.code === 404) {
        this.config = await this.getErrorEntity404NotFoundConfig(
          id,
          sceneId,
          typeStr,
          typeStrPlural,
          gotoNavContext,
          buttons,
        );
      } else if (nodeContext.error.code === 403) {
        this.config = await this.getError403Config();
      } else {
        this.config = await this.getErrorDefaultConfig();
      }
    } else {
      switch (nodeContext.error.code) {
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

    if (!this.config.sceneConfig) {
      this.luigiCoreService.showAlert({
        text: 'Scene config not found',
        type: 'error',
      });

      return;
    }

    this.sceneConfig = this.config.sceneConfig as SceneConfig;
    this.cdr.markForCheck();
  }

  private async getError404Config() {
    const confButtons =
      (this.context().error.errorComponentConfig || {})['404']?.buttons || [];
    const buttons: ButtonConfig[] = [];
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
          id: 'fiori/NoEntries',
        },
      },
      illustratedMessageTitle: await this.i18nService.getTranslationAsync(
        'ERROR_CONTENT_NOT_FOUND_TITLE',
      ),
      illustratedMessageText: await this.i18nService.getTranslationAsync(
        'ERROR_CONTENT_NOT_FOUND_TEXT',
      ),
      buttons,
    };
  }

  private async getError403Config() {
    const illustratedMessageText = await this.i18nService.getTranslationAsync(
      'ERROR_CONTENT_NOT_ALLOWED_NO_PROJECT_MEMBER_TEXT',
    );

    return {
      sceneConfig: {
        scene: {
          url: 'assets/moments/tnt-Scene-UnsuccessfulAuth.svg',
          id: 'tnt/UnsuccessfulAuth',
        },
      },
      illustratedMessageTitle: '',
      illustratedMessageText,
      buttons: [
        {
          url: '',
          label: await this.i18nService.getTranslationAsync(
            'ERROR_CONTENT_NOT_ALLOWED_JOIN_PROJECT_BUTTON',
          ),
        },
        {
          url: '',
          label: await this.i18nService.getTranslationAsync(
            'ERROR_CONTENT_NOT_ALLOWED_VIEW_PROJECT_BUTTON',
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
          id: 'UnableToLoad',
        },
      },
      illustratedMessageTitle: await this.i18nService.getTranslationAsync(
        'ERROR_UNIDENTIFIED_TITLE',
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
    buttons: any[],
  ) {
    const illustratedMessageTitle = await this.i18nService.getTranslationAsync(
      'ERROR_ENTITY_NOT_FOUND_TITLE',
      { entityType: typeStr, entityId: `<b>${id}</b>` },
    );
    const illustratedMessageText =
      typeStrPlural && gotoNavContext
        ? await this.i18nService.getTranslationAsync(
            'ERROR_ENTITY_NOT_FOUND_TEXT_LIST',
            {
              entityTypePlural: typeStrPlural,
              entityTypePlural_lowerCase: typeStrPlural.toLowerCase(),
            },
          )
        : await this.i18nService.getTranslationAsync(
            'ERROR_ENTITY_NOT_FOUND_TEXT_NO_LIST',
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
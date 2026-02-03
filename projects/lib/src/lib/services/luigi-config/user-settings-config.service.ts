import { THEMING_SERVICE } from '../../injection-tokens';
import {
  LocalDevelopmentSettings,
  LuigiNode,
  LuigiUserSettings,
} from '../../models';
import { DependenciesVersionsService } from '../dependencies-versions.service';
import { I18nService } from '../i18n.service';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthService, EnvConfigService } from '../portal';
import {
  featureToggleLocalStorage,
  localDevelopmentSettingsLocalStorage,
  userSettingsLocalStorage,
} from '../storage-service';
import { ThemingService } from '../theming.service';
import { Injectable, inject } from '@angular/core';
import isEqual from 'lodash.isequal';

export interface UserSettings {
  frame_userAccount?: any;
  frame_appearance?: any;
  frame_development?: any;
  frame_versions?: any;
  frame_featureToggle?: any;
}

export interface UserSettingsValues {
  frame_userAccount?: {
    name?: string;
    email?: string;
    language: string;
  };
  frame_appearance?: {
    selectedTheme: string;
  };
  frame_development?: {
    localDevelopmentSettings: LocalDevelopmentSettings;
  };
  frame_versions?: any;
  frame_featureToggle?: {
    featureToggleSettings: Record<string, boolean>;
  };
}

@Injectable({ providedIn: 'root' })
export class UserSettingsConfigService {
  private luigiThemingService = inject<ThemingService>(THEMING_SERVICE as any, {
    optional: true,
  });
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);
  private luigiCoreService = inject(LuigiCoreService);
  private dependenciesVersionsService = inject(DependenciesVersionsService);
  private envConfigService = inject(EnvConfigService);
  private versionsConfig: Record<string, string> = {};

  async getUserSettings(childrenByEntity: Record<string, LuigiNode[]>) {
    const userSettingsConfig = this.extractUserSettings(childrenByEntity);
    const groupsFromNodes = this.getGroupsFromUserSettings(userSettingsConfig);
    this.versionsConfig = await this.readDependenciesVersions();
    const envConfig = await this.envConfigService.getEnvConfig();

    let coreGroups = await this.getCoreUserSettingsGroups();

    return {
      userSettingsProfileMenuEntry: {
        label: 'USERSETTINGSPROFILEMENUENTRY_SETTINGS',
      },
      userSettingsDialog: {
        dismissBtn: 'USERSETTINGSDIALOG_CANCEL',
        saveBtn: 'USERSETTINGSDIALOG_SAVE',
        dialogHeader: 'USERSETTINGSDIALOG_HEADER',
      },
      userSettingGroups: { ...coreGroups, ...groupsFromNodes },

      readUserSettings: () => {
        return userSettingsLocalStorage
          .read(this.authService.getUserInfo())
          .then((setting: any) => {
            return {
              ...(setting || {}),
              frame_versions: this.versionsConfig,
            };
          });
      },

      storeUserSettings: (
        settings: UserSettingsValues,
        previous: UserSettingsValues,
      ) => {
        userSettingsLocalStorage.store(settings);
        this.applyNewTheme(settings, previous);
        this.changeToSelectedLanguage(settings, previous);
        this.saveLocalDevelopmentSettings(settings, previous);
        if (envConfig.uiOptions?.includes('enableFeatureToggleSetting')) {
          this.saveFeatureToggleSettings(settings);
        }
      },
    };
  }

  private async getCoreUserSettingsGroups() {
    const envConfig = await this.envConfigService.getEnvConfig();
    const settings: UserSettings = {};

    await this.addUserSettings(settings);
    await this.addThemingSettings(settings);
    this.addLocalDevelopmentSettings(settings);
    if (envConfig.uiOptions?.includes('enableFeatureToggleSetting')) {
      this.addFeatureToggleSettings(settings);
    }
    this.addInfoSettings(settings);

    return settings;
  }

  private saveFeatureToggleSettings(settings: UserSettingsValues) {
    const currentFeatureToggleSettings =
      settings?.frame_featureToggle?.featureToggleSettings;

    if (currentFeatureToggleSettings) {
      featureToggleLocalStorage.store(currentFeatureToggleSettings);
      this.luigiCoreService.unsetAllFeatureToggles();
      this.luigiCoreService.setFeatureToggles(currentFeatureToggleSettings);
      globalThis.location.reload();
    }
  }

  private saveLocalDevelopmentSettings(
    settings: UserSettingsValues,
    previous: UserSettingsValues,
  ) {
    const currentLocalDevelopmentSettings =
      settings?.frame_development?.localDevelopmentSettings;
    const previousLocalDevelopmentSettings =
      previous?.frame_development?.localDevelopmentSettings;
    if (
      currentLocalDevelopmentSettings &&
      (!localDevelopmentSettingsLocalStorage.read() ||
        !isEqual(
          currentLocalDevelopmentSettings,
          previousLocalDevelopmentSettings,
        ))
    ) {
      localDevelopmentSettingsLocalStorage.store(
        currentLocalDevelopmentSettings,
      );

      globalThis.location.reload();
    }
  }

  private extractUserSettings(
    childrenByEntity: Record<string, LuigiNode[]>,
  ): LuigiUserSettings[] {
    const userSettings = Object.values(childrenByEntity)
      .reduce((accumulator, value) => accumulator.concat(value), [])
      .reduce((accu, n) => {
        if (n._userSettingsConfig) {
          accu.push(n._userSettingsConfig);
        }
        return accu;
      }, [] as LuigiUserSettings[]);

    return userSettings;
  }

  private changeToSelectedLanguage(
    settings: UserSettingsValues,
    previous: UserSettingsValues,
  ) {
    if (
      settings?.frame_userAccount?.language &&
      previous?.frame_userAccount?.language !==
        settings?.frame_userAccount?.language
    ) {
      globalThis.location.reload();
    }
  }

  private applyNewTheme(
    settings: UserSettingsValues,
    previous: UserSettingsValues,
  ) {
    if (
      settings?.frame_appearance?.selectedTheme &&
      previous?.frame_appearance?.selectedTheme !==
        settings?.frame_appearance?.selectedTheme
    ) {
      this.luigiThemingService?.applyTheme(
        settings.frame_appearance.selectedTheme,
      );
    }
  }

  private getGroupsFromUserSettings(luigiUserSettings: LuigiUserSettings[]) {
    const settingsGroups = {};
    luigiUserSettings.forEach((userConfig) => {
      if (userConfig?.groups) {
        Object.keys(userConfig.groups).forEach((groupId) => {
          settingsGroups[groupId] = userConfig.groups[groupId];
        });
      }
    });

    return settingsGroups;
  }

  private async getSelectedThemeDisplayName(): Promise<string> {
    const user = this.authService.getUserInfo();
    const userSettings = await userSettingsLocalStorage.read(user);
    const selectedTheme =
      userSettings?.frame_appearance?.selectedTheme ||
      this.luigiThemingService?.getDefaultThemeId();
    return (
      this.luigiThemingService
        ?.getAvailableThemes()
        ?.find((t) => t.id === selectedTheme)?.name || ''
    );
  }

  private async addThemingSettings(settings: UserSettings) {
    if (this.luigiThemingService) {
      settings.frame_appearance = {
        label: 'USERSETTINGSDIALOG__APPEARANCE',
        sublabel: await this.getSelectedThemeDisplayName(),
        icon: 'palette',
        title: 'USERSETTINGSDIALOG__APPEARANCE',
        viewUrl: '/settings-theming#disable_loading_indicator',
        settings: {},
      };
    }
  }

  private addLocalDevelopmentSettings(settings: UserSettings) {
    settings.frame_development = {
      label: 'LOCAL_DEVELOPMENT_SETTINGS_DIALOG_LABEL',
      sublabel: 'LOCAL_DEVELOPMENT_SETTINGS_DIALOG_SUBLABEL',
      icon: 'developer-settings',
      iconClassAttribute: localDevelopmentSettingsLocalStorage.read()?.isActive
        ? 'settings-icon-active'
        : '',
      title: 'LOCAL_DEVELOPMENT_SETTINGS_DIALOG_TITLE',
      viewUrl: '/assets/openmfp-portal-ui-wc.js#development-settings',
      webcomponent: {
        selfRegistered: true,
      },
      context: {
        translationTable: this.i18nService.translationTable,
      },
    };
  }

  private async addUserSettings(settings: UserSettings) {
    const userInfo = this.authService.getUserInfo();
    const { userAvatarUrl } = await this.envConfigService.getEnvConfig();
    const imageUrl = userAvatarUrl?.replace('${userId}', userInfo.userId);

    if (userInfo.email || userInfo.userId) {
      settings.frame_userAccount = {
        label: 'USERSETTINGSDIALOG_USER_ACCOUNT',
        sublabel: userInfo.name,
        icon: imageUrl || userInfo.icon || 'person-placeholder',
        title: userInfo.name,
        initials: userInfo.initials,
        iconClassAttribute:
          'fd-avatar fd-avatar--s fd-avatar--circle fd-avatar--thumbnail lui-avatar-space',
        settings: {
          name: {
            type: 'string',
            label: 'USERSETTINGSDIALOG_NAME',
            isEditable: false,
          },
          email: {
            type: 'string',
            label: 'USERSETTINGSDIALOG_EMAIL',
            isEditable: false,
          },
        },
      };

      const validLanguages = await this.i18nService.getValidLanguages();
      if (validLanguages.length > 1) {
        settings.frame_userAccount.settings['language'] = {
          type: 'enum',
          label: 'USERSETTINGSDIALOG_LANGUAGE',
          options: validLanguages,
        };
      }
    }
  }

  private addInfoSettings(settings: UserSettings) {
    const settingsTransformed =
      this.dependenciesVersionsService.transformVersionsConfig(
        this.versionsConfig,
      );

    settings.frame_versions = {
      label: 'INFO_SETTINGS_DIALOG_LABEL',
      sublabel: 'INFO_SETTINGS_DIALOG_SUBLABEL',
      title: 'INFO_SETTINGS_DIALOG_TITLE',
      icon: 'message-information',
      settings: settingsTransformed,
    };
  }

  private addFeatureToggleSettings(settings: UserSettings) {
    const isActive =
      this.luigiCoreService.getActiveFeatureToggleList().length > 0;

    settings.frame_featureToggle = {
      label: 'FEATURE_TOGGLE_SETTINGS_DIALOG_LABEL',
      sublabel: 'FEATURE_TOGGLE_SETTINGS_DIALOG_SUBLABEL',
      title: 'FEATURE_TOGGLE_SETTINGS_DIALOG_TITLE',
      icon: 'activate',
      iconClassAttribute: isActive ? 'settings-icon-active' : '',
      viewUrl: '/assets/openmfp-portal-ui-wc.js#feature-toggle',
      webcomponent: {
        selfRegistered: true,
      },
      context: {
        translationTable: this.i18nService.translationTable,
      },
    };
  }

  private async readDependenciesVersions(): Promise<Record<string, string>> {
    const versions = { browser: navigator.userAgent };
    try {
      return {
        ...(await this.dependenciesVersionsService.read()),
        ...versions,
      };
    } catch (error) {}
    return versions;
  }
}

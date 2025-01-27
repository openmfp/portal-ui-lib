import { inject, Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { THEMING_SERVICE } from '../../injection-tokens';
import { LuigiNode, LuigiUserSettings } from '../../models';
import { DependenciesVersionsService } from '../dependencies-versions.service';
import { I18nService } from '../i18n.service';
import { AuthService } from '../portal';
import {
  localDevelopmentSettingsLocalStorage,
  userSettingsLocalStorage,
} from '../storage-service';
import { ThemingService } from '../theming.service';

interface UserSettings {
  frame_userAccount?: any;
  frame_appearance?: any;
  frame_development?: any;
  frame_versions?: any;
}

@Injectable({ providedIn: 'root' })
export class UserSettingsConfigService {
  private luigiThemingService = inject<ThemingService>(THEMING_SERVICE as any, {
    optional: true,
  });
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);
  private dependenciesVersionsService = inject(DependenciesVersionsService);
  private versionsConfig: Record<string, string>;

  async getUserSettings(childrenByEntity: Record<string, LuigiNode[]>) {
    const userSettingsConfig = this.extractUserSettings(childrenByEntity);
    const groupsFromNodes = this.getGroupsFromUserSettings(userSettingsConfig);
    this.versionsConfig = await this.readDependenciesVersions();

    let coreGroups = await this.getCoreUserSettingsGroups();

    const userSettings = {
      userSettingsProfileMenuEntry: {
        label: 'USERSETTINGSPROFILEMENUENTRY_SETTINGS',
      },
      userSettingsDialog: {
        dismissBtn: 'USERSETTINGSDIALOG_CANCEL',
        saveBtn: 'USERSETTINGSDIALOG_SAVE',
        dialogHeader: 'USERSETTINGSDIALOG_HEADER',
      },
      userSettingGroups: { ...coreGroups, ...groupsFromNodes },

      readUserSettings: async () => {
        const setting: any =
          (await userSettingsLocalStorage.read(this.authService.getUser())) ||
          {};
        setting.frame_versions = this.versionsConfig;
        return setting;
      },

      storeUserSettings: async (settings, previous) => {
        userSettingsLocalStorage.store(settings);
        this.applyNewTheme(settings, previous);
        this.changeToSelectedLanguage(settings, previous);
        this.saveLocalDevelopmentSettings(settings, previous);
      },
    };
    return userSettings;
  }

  private async getCoreUserSettingsGroups() {
    const settings: UserSettings = {};
    await this.addUserSettings(settings);
    await this.addThemingSettings(settings);
    this.addLocalDevelopmentSettings(settings);
    this.addInfoSettings(settings);

    return settings;
  }

  private saveLocalDevelopmentSettings(settings, previous) {
    const currentLocalDevelopmentSettings =
      settings?.frame_development?.localDevelopmentSettings;
    const previousLocalDevelopmentSettings =
      previous?.frame_development?.localDevelopmentSettings;
    if (
      currentLocalDevelopmentSettings &&
      (!localDevelopmentSettingsLocalStorage.read() ||
        !isEqual(
          currentLocalDevelopmentSettings,
          previousLocalDevelopmentSettings
        ))
    ) {
      localDevelopmentSettingsLocalStorage.store(
        currentLocalDevelopmentSettings
      );

      globalThis.location.reload();
    }
  }

  private extractUserSettings(
    childrenByEntity: Record<string, LuigiNode[]>
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

  private changeToSelectedLanguage(settings, previous) {
    if (
      settings?.frame_userAccount?.language &&
      previous?.frame_userAccount?.language !==
        settings?.frame_userAccount?.language
    ) {
      globalThis.location.reload();
    }
  }

  private applyNewTheme(settings, previous) {
    if (
      settings?.frame_appearance?.selectedTheme &&
      previous?.frame_appearance?.selectedTheme !==
        settings?.frame_appearance?.selectedTheme
    ) {
      this.luigiThemingService?.applyTheme(
        settings.frame_appearance.selectedTheme
      );
    }
  }

  private getGroupsFromUserSettings(luigiUserSettings: LuigiUserSettings[]) {
    const settingsGroups = {};
    luigiUserSettings.forEach((userConfig) => {
      if (userConfig?.groups) {
        Object.keys(userConfig.groups).forEach((groupId) => {
          const groupConfig = userConfig.groups[groupId];
          settingsGroups[groupId] = groupConfig;
        });
      }
    });

    return settingsGroups;
  }

  private async getSelectedThemeDisplayName(): Promise<string> {
    const user = this.authService.getUser();
    const userSettings = (await userSettingsLocalStorage.read(user)) as any;
    const selectedTheme =
      userSettings?.frame_appearance?.selectedTheme ||
      this.luigiThemingService.getDefaultThemeId();
    return this.luigiThemingService
      .getAvailableThemes()
      .find((t) => t.id === selectedTheme)?.name;
  }

  private async addThemingSettings(settings: UserSettings) {
    if (this.luigiThemingService) {
      settings.frame_appearance = {
        label: 'USERSETTINGSDIALOG__APPEARANCE',
        sublabel: await this.getSelectedThemeDisplayName(),
        icon: 'palette',
        title: 'USERSETTINGSDIALOG__APPEARANCE',
        viewUrl: '/settings-theming#dxp_disable_loading_indicator',
        settings: {},
      };
    }
  }

  private addLocalDevelopmentSettings(settings: UserSettings) {
    settings.frame_development = {
      label: 'LOCAL_DEVELOPMENT_SETTINGS_DIALOG_LABEL',
      sublabel: 'LOCAL_DEVELOPMENT_SETTINGS_DIALOG_SUBLABEL',
      icon: 'action-settings',
      iconClassAttribute: localDevelopmentSettingsLocalStorage.read()?.isActive
        ? 'local-development-settings-icon-active'
        : '',
      title: 'LOCAL_DEVELOPMENT_SETTINGS_DIALOG_TITLE',
      viewUrl: '/development-settings#dxp_disable_loading_indicator',
    };
  }

  private async addUserSettings(settings: UserSettings) {
    const userInfo = this.authService.getUserInfo();
    settings.frame_userAccount = {
      label: 'USERSETTINGSDIALOG_USER_ACCOUNT',
      sublabel: userInfo.name,
      icon: `https://avatars.wdf.sap.corp/avatar/${this.authService.getUsername()}`,
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
        mail: {
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

  private addInfoSettings(settings: UserSettings) {
    if (!this.versionsConfig) {
      return;
    }

    const settingsTransformed =
      this.dependenciesVersionsService.transformVersionsConfig(
        this.versionsConfig
      );

    settings.frame_versions = {
      label: 'INFO_SETTINGS_DIALOG_LABEL',
      sublabel: 'INFO_SETTINGS_DIALOG_SUBLABEL',
      title: 'INFO_SETTINGS_DIALOG_TITLE',
      icon: 'message-information',
      settings: settingsTransformed,
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

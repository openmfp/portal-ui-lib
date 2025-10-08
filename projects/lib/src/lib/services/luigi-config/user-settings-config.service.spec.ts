import { THEMING_SERVICE } from '../../injection-tokens';
import {
  ClientEnvironment,
  LuigiNode,
  LuigiUserSettings,
  UserData,
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
import {
  UserSettingsConfigService,
  UserSettingsValues,
} from './user-settings-config.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';

jest.mock('../storage-service');

describe('UserSettingsConfigService', () => {
  let service: UserSettingsConfigService;
  const themingServiceMock = mock<ThemingService>();
  const authServiceMock = mock<AuthService>();
  const i18nServiceMock = mock<I18nService>();
  const dependenciesVersionsService = mock<DependenciesVersionsService>();
  const luigiCoreServiceMock = mock<LuigiCoreService>();
  const envConfigServiceMock = mock<EnvConfigService>();

  beforeEach(() => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({
      uiOptions: ['enableFeatureToggleSetting'],
    } as ClientEnvironment);

    const originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      reload: jest.fn(),
    } as any;

    dependenciesVersionsService.read.mockResolvedValue({});
    luigiCoreServiceMock.getActiveFeatureToggleList.mockReturnValue([]);

    TestBed.configureTestingModule({
      providers: [
        UserSettingsConfigService,
        { provide: THEMING_SERVICE, useValue: themingServiceMock },
        {
          provide: DependenciesVersionsService,
          useValue: dependenciesVersionsService,
        },
        { provide: AuthService, useValue: authServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        { provide: EnvConfigService, useValue: envConfigServiceMock },
      ],
    });

    service = TestBed.inject(UserSettingsConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getUserSettings', () => {
    beforeEach(() => {
      authServiceMock.getUserInfo.mockReturnValue({
        name: 'Test User',
        initials: 'TU',
      } as any);
      authServiceMock.getUserInfo.mockReturnValue({
        userId: 'testuser',
      } as UserData);
      themingServiceMock.getDefaultThemeId.mockReturnValue('default-theme');
      themingServiceMock.getAvailableThemes.mockReturnValue([
        { id: 'default-theme', name: 'Default Theme', description: 'des' },
      ]);
      i18nServiceMock.getValidLanguages.mockResolvedValue([
        { value: 'en', label: '' },
        { value: 'de', label: '' },
      ]);
    });

    it('should return user settings configuration with core groups', async () => {
      const childrenByEntity: Record<string, LuigiNode[]> = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(result.userSettingsDialog).toBeDefined();
      expect(result.userSettingsProfileMenuEntry).toBeDefined();
      expect(result.userSettingGroups.frame_userAccount).toBeDefined();
      expect(result.userSettingGroups.frame_appearance).toBeDefined();
      expect(result.userSettingGroups.frame_development).toBeDefined();
      expect(result.userSettingGroups.frame_versions).toBeDefined();
    });

    it('should return user settings configuration with default versions', async () => {
      const childrenByEntity: Record<string, LuigiNode[]> = {};
      dependenciesVersionsService.read.mockRejectedValue('error');

      const result = await service.getUserSettings(childrenByEntity);

      expect(result.userSettingsDialog).toBeDefined();
      expect(service['versionsConfig']).toEqual({
        browser: jasmine.any(String),
      });
    });

    it('should extract user settings from children entities', async () => {
      const mockUserSettings: LuigiUserSettings = {
        groups: {
          custom_group: {
            label: 'Custom Group',
            settings: {},
          },
        },
      };

      const childrenByEntity: Record<string, LuigiNode[]> = {
        entity1: [{ _userSettingsConfig: mockUserSettings } as LuigiNode],
      };

      const result = await service.getUserSettings(childrenByEntity);
      expect((result.userSettingGroups as any).custom_group).toBeDefined();
      expect((result.userSettingGroups as any).custom_group.label).toBe(
        'Custom Group',
      );
    });

    it('should handle read and store operations', async () => {
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      // Test read operation
      await result.readUserSettings();
      expect(userSettingsLocalStorage.read).toHaveBeenCalled();

      // Test store operation
      const newSettings = {
        frame_appearance: { selectedTheme: 'new-theme' },
        frame_userAccount: { name: 'name', email: 'email', language: 'de' },
        frame_development: {
          localDevelopmentSettings: {
            isActive: true,
            configs: [],
            serviceProviderConfig: {},
          },
        },
      };
      const previousSettings = {
        frame_appearance: { selectedTheme: 'old-theme' },
        frame_userAccount: { language: 'en' },
      } as UserSettingsValues;

      await result.storeUserSettings(newSettings, previousSettings);
      expect(userSettingsLocalStorage.store).toHaveBeenCalledWith(newSettings);
      expect(themingServiceMock.applyTheme).toHaveBeenCalledWith('new-theme');
      expect(globalThis.location.reload).toHaveBeenCalled();
      expect(localDevelopmentSettingsLocalStorage.store).toHaveBeenCalledWith({
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      });
    });
  });

  describe('Core groups configuration', () => {
    it('should include language settings when multiple languages are available', async () => {
      i18nServiceMock.getValidLanguages.mockResolvedValue([
        { value: 'en', label: '' },
        { value: 'de', label: '' },
        { value: 'fr', label: '' },
      ]);
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(
        result.userSettingGroups.frame_userAccount.settings.language,
      ).toBeDefined();
      expect(
        result.userSettingGroups.frame_userAccount.settings.language.type,
      ).toBe('enum');
      expect(
        result.userSettingGroups.frame_userAccount.settings.language.options,
      ).toEqual([
        { value: 'en', label: '' },
        { value: 'de', label: '' },
        { value: 'fr', label: '' },
      ]);
    });

    it('should not include language settings when only one language is available', async () => {
      i18nServiceMock.getValidLanguages.mockResolvedValue([
        { value: 'en', label: '' },
      ]);
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(
        result.userSettingGroups.frame_userAccount.settings.language,
      ).toBeUndefined();
    });

    it('should handle local development settings changes', async () => {
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      const newSettings = {
        frame_development: {
          localDevelopmentSettings: { isActive: true },
        },
      } as UserSettingsValues;
      const previousSettings = {
        frame_development: {
          localDevelopmentSettings: { isActive: false },
        },
      } as UserSettingsValues;

      globalThis.location.reload = jest.fn();

      await result.storeUserSettings(newSettings, previousSettings);
      expect(localDevelopmentSettingsLocalStorage.store).toHaveBeenCalledWith({
        isActive: true,
      });
      expect(globalThis.location.reload).toHaveBeenCalled();
    });
  });

  describe('Theme handling', () => {
    it('should get selected theme display name', async () => {
      const mockUserSettings = {
        frame_appearance: {
          selectedTheme: 'custom-theme',
        },
      };
      userSettingsLocalStorage.read = jest
        .fn()
        .mockResolvedValue(mockUserSettings);
      themingServiceMock.getAvailableThemes.mockReturnValue([
        { id: 'custom-theme', name: 'Custom Theme', description: 'des' },
      ]);

      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(result.userSettingGroups.frame_appearance.sublabel).toBe(
        'Custom Theme',
      );
    });

    it('should fall back to default theme when no theme is selected', async () => {
      userSettingsLocalStorage.read = jest.fn().mockResolvedValue({});
      themingServiceMock.getDefaultThemeId.mockReturnValue('default-theme');
      themingServiceMock.getAvailableThemes.mockReturnValue([
        { id: 'default-theme', name: 'Default Theme', description: 'des' },
      ]);

      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(result.userSettingGroups.frame_appearance.sublabel).toBe(
        'Default Theme',
      );
    });
  });

  describe('Feature Toggle Settings', () => {
    beforeEach(() => {
      luigiCoreServiceMock.getActiveFeatureToggleList.mockReturnValue([
        'feature1',
        'feature2',
      ]);
    });

    it('should include feature toggle settings when enabled', async () => {
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(result.userSettingGroups.frame_featureToggle).toBeDefined();
      expect(result.userSettingGroups.frame_featureToggle.label).toBe(
        'FEATURE_TOGGLE_SETTINGS_DIALOG_LABEL',
      );
      expect(
        result.userSettingGroups.frame_featureToggle.iconClassAttribute,
      ).toBe('settings-icon-active');
    });

    it('should not include feature toggle settings when disabled', async () => {
      envConfigServiceMock.getEnvConfig.mockResolvedValue({
        uiOptions: [],
      } as ClientEnvironment);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          UserSettingsConfigService,
          { provide: THEMING_SERVICE, useValue: themingServiceMock },
          {
            provide: DependenciesVersionsService,
            useValue: dependenciesVersionsService,
          },
          { provide: AuthService, useValue: authServiceMock },
          { provide: I18nService, useValue: i18nServiceMock },
          { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
          { provide: EnvConfigService, useValue: envConfigServiceMock },
        ],
      });

      const disabledService = TestBed.inject(UserSettingsConfigService);
      const childrenByEntity = {};
      const result = await disabledService.getUserSettings(childrenByEntity);

      expect(result.userSettingGroups.frame_featureToggle).toBeUndefined();
    });

    it('should save feature toggle settings when enabled', async () => {
      globalThis.location.reload = jest.fn();
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      const newSettings = {
        frame_featureToggle: {
          featureToggleSettings: { feature1: true, feature2: false },
        },
      } as UserSettingsValues;
      const previousSettings = {} as UserSettingsValues;

      await result.storeUserSettings(newSettings, previousSettings);

      expect(featureToggleLocalStorage.store).toHaveBeenCalledWith({
        feature1: true,
        feature2: false,
      });
      expect(luigiCoreServiceMock.unsetAllFeatureToggles).toHaveBeenCalled();
      expect(luigiCoreServiceMock.setFeatureToggles).toHaveBeenCalledWith({
        feature1: true,
        feature2: false,
      });
      expect(globalThis.location.reload).toHaveBeenCalled();
    });

    it('should not save feature toggle settings when disabled', async () => {
      TestBed.resetTestingModule();
      envConfigServiceMock.getEnvConfig.mockResolvedValue({
        uiOptions: [],
      } as ClientEnvironment);

      TestBed.configureTestingModule({
        providers: [
          UserSettingsConfigService,
          { provide: THEMING_SERVICE, useValue: themingServiceMock },
          {
            provide: DependenciesVersionsService,
            useValue: dependenciesVersionsService,
          },
          { provide: AuthService, useValue: authServiceMock },
          { provide: I18nService, useValue: i18nServiceMock },
          { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
          { provide: EnvConfigService, useValue: envConfigServiceMock },
        ],
      });
      globalThis.location.reload = jest.fn();

      const disabledService = TestBed.inject(UserSettingsConfigService);
      const childrenByEntity = {};
      const result = await disabledService.getUserSettings(childrenByEntity);

      const newSettings = {
        frame_featureToggle: {
          featureToggleSettings: { feature1: true, feature2: false },
        },
      } as UserSettingsValues;
      const previousSettings = {} as UserSettingsValues;

      await result.storeUserSettings(newSettings, previousSettings);

      expect(featureToggleLocalStorage.store).not.toHaveBeenCalled();
      expect(
        luigiCoreServiceMock.unsetAllFeatureToggles,
      ).not.toHaveBeenCalled();
      expect(luigiCoreServiceMock.setFeatureToggles).not.toHaveBeenCalled();
      expect(globalThis.location.reload).not.toHaveBeenCalled();
    });

    it('should show inactive icon when no feature toggles are active', async () => {
      luigiCoreServiceMock.getActiveFeatureToggleList.mockReturnValue([]);

      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      expect(
        result.userSettingGroups.frame_featureToggle.iconClassAttribute,
      ).toBe('');
    });
  });
});

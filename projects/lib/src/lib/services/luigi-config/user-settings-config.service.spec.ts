import { TestBed } from '@angular/core/testing';
import { DependenciesVersionsService } from '../dependencies-versions.service';
import { UserSettingsConfigService } from './user-settings-config.service';
import { ThemingService } from '../theming.service';
import { AuthService } from '../portal';
import { I18nService } from '../i18n.service';
import { THEMING_SERVICE } from '../../injection-tokens';
import {
  userSettingsLocalStorage,
  localDevelopmentSettingsLocalStorage,
  LocalStorageKeys,
} from '../storage-service';
import { LuigiNode, LuigiUserSettings } from '../../models';
import { mock } from 'jest-mock-extended';

jest.mock('../storage-service');

describe('UserSettingsConfigService', () => {
  let service: UserSettingsConfigService;
  const themingServiceMock = mock<ThemingService>();
  const authServiceMock = mock<AuthService>();
  const i18nServiceMock = mock<I18nService>();
  const dependenciesVersionsService = mock<DependenciesVersionsService>();

  beforeEach(() => {
    const originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      reload: jest.fn(),
    };

    dependenciesVersionsService.read.mockResolvedValue({});

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
      authServiceMock.getUsername.mockReturnValue('testuser');
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
        'Custom Group'
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
        frame_userAccount: { language: 'de' },
        frame_development: { localDevelopmentSettings: { isActive: true } },
      };
      const previousSettings = {
        frame_appearance: { selectedTheme: 'old-theme' },
        frame_userAccount: { language: 'en' },
      };

      await result.storeUserSettings(newSettings, previousSettings);
      expect(userSettingsLocalStorage.store).toHaveBeenCalledWith(newSettings);
      expect(themingServiceMock.applyTheme).toHaveBeenCalledWith('new-theme');
      expect(globalThis.location.reload).toHaveBeenCalled();
      expect(localDevelopmentSettingsLocalStorage.store).toHaveBeenCalledWith({
        isActive: true,
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
        result.userSettingGroups.frame_userAccount.settings.language
      ).toBeDefined();
      expect(
        result.userSettingGroups.frame_userAccount.settings.language.type
      ).toBe('enum');
      expect(
        result.userSettingGroups.frame_userAccount.settings.language.options
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
        result.userSettingGroups.frame_userAccount.settings.language
      ).toBeUndefined();
    });

    it('should handle local development settings changes', async () => {
      const childrenByEntity = {};
      const result = await service.getUserSettings(childrenByEntity);

      const newSettings = {
        frame_development: {
          localDevelopmentSettings: { isActive: true },
        },
      };
      const previousSettings = {
        frame_development: {
          localDevelopmentSettings: { isActive: false },
        },
      };

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
        'Custom Theme'
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
        'Default Theme'
      );
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  ContentDensityDirective,
  FormControlComponent,
  FormItemComponent,
  FormLabelComponent,
  LinkComponent,
  ListComponent,
  ListItemComponent,
  ListSecondaryDirective,
  ListTitleDirective,
  SwitchComponent,
} from '@fundamental-ngx/core';
import { DevelopmentSettingsComponent } from './development-settings.component';
import {
  I18nService,
  localDevelopmentSettingsLocalStorage,
} from '../../services';
import { sendCustomMessage } from '@luigi-project/client';

jest.mock('@luigi-project/client', () => ({
  sendCustomMessage: jest.fn(),
}));

describe('DevelopmentSettingsComponent', () => {
  let component: DevelopmentSettingsComponent;
  let fixture: ComponentFixture<DevelopmentSettingsComponent>;
  let i18nServiceMock: jest.Mocked<I18nService>;

  beforeEach(async () => {
    i18nServiceMock = {
      getTranslation: jest.fn((key) => `translated_${key}`),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        DevelopmentSettingsComponent,
        ListComponent,
        ButtonComponent,
        ListItemComponent,
        ListTitleDirective,
        FormLabelComponent,
        FormItemComponent,
        FormControlComponent,
        ContentDensityDirective,
        ListSecondaryDirective,
        SwitchComponent,
        LinkComponent,
      ],
      providers: [{ provide: I18nService, useValue: i18nServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DevelopmentSettingsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ngOnInit', () => {
    it('should initialize with stored settings when available in DEVELOPMENT_MODE_CONFIG', () => {
      const mockSettings = {
        isActive: true,
        configs: [{ url: 'http://test.com' }],
        serviceProviderConfig: { key: 'value' },
      };

      localDevelopmentSettingsLocalStorage.read = jest
        .fn()
        .mockReturnValue(mockSettings);

      component.ngOnInit();
      expect(component['localDevelopmentSettings']).toEqual(mockSettings);
    });

    it('should initialize with fallback stored settings when DEVELOPMENT_MODE_CONFIG is not available', () => {
      const mockSettings = {
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      };

      localDevelopmentSettingsLocalStorage.read = jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockSettings);

      component.ngOnInit();
      expect(component['localDevelopmentSettings']).toEqual(mockSettings);
    });

    it('should initialize with default settings when no stored settings available', () => {
      localDevelopmentSettingsLocalStorage.read = jest
        .fn()
        .mockReturnValue(null);

      component.ngOnInit();
      expect(component['localDevelopmentSettings']).toEqual({
        isActive: false,
        configs: [
          {
            url: 'http://localhost:4200/assets/content-configuration-global.json',
          },
          {
            url: 'http://localhost:4200/assets/content-configuration.json',
          },
        ],
        serviceProviderConfig: {},
      });
    });
  });

  describe('addUrl', () => {
    it('should add valid URL to configs even if the configs is null', () => {
      component['localDevelopmentSettings'].configs = null;
      const validUrl = 'https://test.com';
      component.addUrl(validUrl);

      expect(component['localDevelopmentSettings'].configs).toContainEqual({
        url: validUrl,
      });
      expect(sendCustomMessage).toHaveBeenCalled();
    });

    it('should add valid URL to configs', () => {
      const validUrl = 'https://test.com';
      component.addUrl(validUrl);

      expect(component['localDevelopmentSettings'].configs).toContainEqual({
        url: validUrl,
      });
      expect(sendCustomMessage).toHaveBeenCalled();
    });

    it('should not add duplicate URL', () => {
      const validUrl = 'https://test.com';
      component['localDevelopmentSettings'].configs = [{ url: validUrl }];

      component.addUrl(validUrl);
      expect(component['localDevelopmentSettings'].configs).toHaveLength(1);
    });

    it('should add error for invalid URL', () => {
      const invalidUrl = 'invalid-url';
      component.addUrl(invalidUrl);

      expect(component['errors']).toContain('pattern');
    });
  });

  describe('removeUrl', () => {
    it('should remove URL at specified index', () => {
      component['localDevelopmentSettings'].configs = [
        { url: 'https://test1.com' },
        { url: 'https://test2.com' },
      ];

      component.removeUrl(0);
      expect(component['localDevelopmentSettings'].configs).toHaveLength(1);
      expect(component['localDevelopmentSettings'].configs[0].url).toBe(
        'https://test2.com'
      );
      expect(sendCustomMessage).toHaveBeenCalled();
    });
  });

  describe('removeServiceProviderConfig', () => {
    it('should remove config by key', () => {
      component['localDevelopmentSettings'].serviceProviderConfig = {
        key1: 'value1',
        key2: 'value2',
      };

      component.removeServiceProviderConfig('key1');
      expect(
        component['localDevelopmentSettings'].serviceProviderConfig
      ).not.toHaveProperty('key1');
      expect(sendCustomMessage).toHaveBeenCalled();
    });
  });

  describe('addServiceProviderConfig', () => {
    it('should add new config when key and value are provided and serviceProviderConfig is null', () => {
      component['localDevelopmentSettings'].serviceProviderConfig = null;

      component.addServiceProviderConfig('newKey', 'newValue');

      expect(
        component['localDevelopmentSettings'].serviceProviderConfig['newKey']
      ).toBe('newValue');
      expect(sendCustomMessage).toHaveBeenCalled();
    });

    it('should add new config when key and value are provided', () => {
      component.addServiceProviderConfig('newKey', 'newValue');
      expect(
        component['localDevelopmentSettings'].serviceProviderConfig['newKey']
      ).toBe('newValue');
      expect(sendCustomMessage).toHaveBeenCalled();
    });

    it('should not add config when key or value is missing', () => {
      component.addServiceProviderConfig('', 'value');
      expect(
        Object.keys(component['localDevelopmentSettings'].serviceProviderConfig)
      ).toHaveLength(0);

      component.addServiceProviderConfig('key', '');
      expect(
        Object.keys(component['localDevelopmentSettings'].serviceProviderConfig)
      ).toHaveLength(0);
    });
  });

  describe('switchIsActive', () => {
    it('should toggle isActive property', () => {
      const initialState = component['localDevelopmentSettings'].isActive;

      component.switchIsActive();
      expect(component['localDevelopmentSettings'].isActive).toBe(
        !initialState
      );
      expect(sendCustomMessage).toHaveBeenCalled();
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(component['isValidUrl']('https://test.com')).toBe(true);
      expect(component['isValidUrl']('http://localhost:4200')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(component['isValidUrl']('invalid-url')).toBe(false);
      expect(component['isValidUrl']('')).toBe(false);
    });
  });

  describe('readTranslations', () => {
    it('should return object with all translated strings', () => {
      const translations = component['readTranslations']();

      expect(translations.explanation).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_EXPLANATION'
      );
      expect(translations.link).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_LINK'
      );
      expect(translations.addButton).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_ADD_BUTTON'
      );
      expect(translations.clearButton).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_CLEAR_BUTTON'
      );
      expect(translations.removeButton).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_REMOVE_BUTTON'
      );
      expect(translations.isDevelopmentModeActive).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_IS_ACTIVE'
      );
      expect(translations.urlsInput.title).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_TITLE'
      );
      expect(translations.urlsInput.label).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_LABEL'
      );
      expect(translations.urlsInput.error).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_ERROR'
      );
      expect(translations.serviceProviderConfig.title).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_TITLE'
      );
      expect(translations.serviceProviderConfig.explanation).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_EXPLANATION'
      );
      expect(translations.serviceProviderConfig.keyInput.label).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_LABEL'
      );
      expect(translations.serviceProviderConfig.keyInput.placeholder).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_PLACEHOLDER'
      );
      expect(translations.serviceProviderConfig.valueInput.label).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_LABEL'
      );
      expect(translations.serviceProviderConfig.valueInput.placeholder).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_PLACEHOLDER'
      );
    });
  });
});

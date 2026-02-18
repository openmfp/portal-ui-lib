import { DevelopmentSettingsComponent } from './development-settings.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Button } from '@fundamental-ngx/ui5-webcomponents/button';
import { Input } from '@fundamental-ngx/ui5-webcomponents/input';
import { Label } from '@fundamental-ngx/ui5-webcomponents/label';
import { Link } from '@fundamental-ngx/ui5-webcomponents/link';
import { List } from '@fundamental-ngx/ui5-webcomponents/list';
import { ListItemCustom } from '@fundamental-ngx/ui5-webcomponents/list-item-custom';
import { Switch } from '@fundamental-ngx/ui5-webcomponents/switch';
import {
  I18nService,
  localDevelopmentSettingsLocalStorage,
} from '@openmfp/portal-ui-lib';
import { MockedObject } from 'vitest';

vi.mock('@luigi-project/client', () => ({
  sendCustomMessage: vi.fn(),
}));

describe('DevelopmentSettingsComponent', () => {
  let component: DevelopmentSettingsComponent;
  let fixture: ComponentFixture<DevelopmentSettingsComponent>;
  let i18nServiceMock: MockedObject<I18nService>;
  let luigiClientMock: { publishEvent: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    i18nServiceMock = {
      getTranslation: vi.fn((key) => `translated_${key}`),
      translationTable: {},
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        DevelopmentSettingsComponent,
        List,
        Button,
        Input,
        Label,
        ListItemCustom,
        Switch,
        Link,
      ],
      providers: [{ provide: I18nService, useValue: i18nServiceMock }],
    })
      .overrideComponent(DevelopmentSettingsComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DevelopmentSettingsComponent);
    component = fixture.componentInstance;
    luigiClientMock = { publishEvent: vi.fn() };
    fixture.componentRef.setInput('LuigiClient', luigiClientMock);
    fixture.componentRef.setInput('context', { translationTable: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ngOnInit', () => {
    it('should initialize with wrong stored settings without config and service null', () => {
      const mockSettings = {
        isActive: true,
        configs: null,
        serviceProviderConfig: null,
      };

      localDevelopmentSettingsLocalStorage.read = vi
        .fn()
        .mockReturnValue(mockSettings);

      component.ngOnInit();

      expect(component.isActive()).toEqual(mockSettings.isActive);
      expect(component.configs()).toEqual([]);
      expect(component.serviceProviderConfig()).toEqual({});
    });

    it('should initialize with wrong stored settings without config and service missing', () => {
      const mockSettings = {
        isActive: true,
      };

      localDevelopmentSettingsLocalStorage.read = vi
        .fn()
        .mockReturnValue(mockSettings);

      component.ngOnInit();

      expect(component.isActive()).toEqual(mockSettings.isActive);
      expect(component.configs()).toEqual([]);
      expect(component.serviceProviderConfig()).toEqual({});
    });

    it('should initialize with stored settings when available in DEVELOPMENT_MODE_CONFIG', () => {
      const mockSettings = {
        isActive: true,
        configs: [{ url: 'http://test.com' }],
        serviceProviderConfig: { key: 'value' },
      };

      localDevelopmentSettingsLocalStorage.read = vi
        .fn()
        .mockReturnValue(mockSettings);

      component.ngOnInit();
      expect(component.isActive()).toEqual(mockSettings.isActive);
      expect(component.configs()).toEqual(mockSettings.configs);
      expect(component.serviceProviderConfig()).toEqual(
        mockSettings.serviceProviderConfig,
      );
    });

    it('should initialize with fallback stored settings when DEVELOPMENT_MODE_CONFIG is not available', () => {
      const mockSettings = {
        isActive: true,
        configs: [],
        serviceProviderConfig: {},
      };

      localDevelopmentSettingsLocalStorage.read = vi
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockSettings);

      component.ngOnInit();
      expect(component.isActive()).toEqual(mockSettings.isActive);
      expect(component.configs()).toEqual(mockSettings.configs);
      expect(component.serviceProviderConfig()).toEqual(
        mockSettings.serviceProviderConfig,
      );
    });

    it('should initialize with default settings when no stored settings available', () => {
      localDevelopmentSettingsLocalStorage.read = vi.fn().mockReturnValue(null);

      component.ngOnInit();
      expect(component.isActive()).toEqual(false);
      expect(component.configs()).toEqual([
        {
          url: 'http://localhost:4200/assets/content-configuration-global.json',
        },
        {
          url: 'http://localhost:4200/assets/content-configuration.json',
        },
      ]);
      expect(component.serviceProviderConfig()).toEqual({});
    });
  });

  describe('addUrl', () => {
    it('should add valid URL to configs', () => {
      component.configs.set([]);
      const validUrl = 'https://test.com';
      component.addUrl(validUrl);

      expect(component.configs()).toContainEqual({
        url: validUrl,
      });
      expect(component.LuigiClient().publishEvent).toHaveBeenCalled();
    });

    it('should not add duplicate URL', () => {
      const validUrl = 'https://test.com';
      component.configs.set([{ url: validUrl }]);

      component.addUrl(validUrl);
      expect(component.configs()).toHaveLength(1);
    });

    it('should add error for invalid URL', () => {
      const invalidUrl = 'invalid-url';
      component.addUrl(invalidUrl);

      expect(component['errors']()).toContain('pattern');
    });

    it('should ignore empty URL without updating configs', () => {
      component.configs.set([]);

      component.addUrl('');

      expect(component.configs()).toEqual([]);
      expect(component['errors']()).toEqual(['pattern']);
      expect(component.LuigiClient().publishEvent).not.toHaveBeenCalled();
    });

    it('should clear errors when a valid URL is added after invalid', () => {
      const validUrl = 'https://valid.com';

      component.addUrl('invalid-url');
      component.addUrl(validUrl);

      expect(component['errors']()).toEqual([]);
      expect(component.configs()).toContainEqual({ url: validUrl });
      expect(component.LuigiClient().publishEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeUrl', () => {
    it('should remove URL at specified index', () => {
      component.configs.set([
        { url: 'https://test1.com' },
        { url: 'https://test2.com' },
      ]);

      component.removeUrl(0);
      expect(component.configs()).toHaveLength(1);
      expect(component.configs()[0].url).toBe('https://test2.com');
      expect(component.LuigiClient().publishEvent).toHaveBeenCalled();
    });
  });

  describe('removeServiceProviderConfig', () => {
    it('should remove config by key', () => {
      component.serviceProviderConfig.set({
        key1: 'value1',
        key2: 'value2',
      });

      component.removeServiceProviderConfig('key1');
      expect(component.serviceProviderConfig()).not.toHaveProperty('key1');
      expect(component.LuigiClient().publishEvent).toHaveBeenCalled();
    });
  });

  describe('addServiceProviderConfig', () => {
    it('should add new config when key and value are provided and serviceProviderConfig is null', () => {
      component.serviceProviderConfig.set({});

      component.addServiceProviderConfig('newKey', 'newValue');

      expect(component.serviceProviderConfig()['newKey']).toBe('newValue');
      expect(component.LuigiClient().publishEvent).toHaveBeenCalled();
    });

    it('should add new config when key and value are provided', () => {
      component.serviceProviderConfig.set({});
      component.addServiceProviderConfig('newKey', 'newValue');
      expect(component.serviceProviderConfig()['newKey']).toBe('newValue');
      expect(component.LuigiClient().publishEvent).toHaveBeenCalled();
    });

    it('should not add config when key or value is missing', () => {
      component.serviceProviderConfig.set({});
      component.addServiceProviderConfig('', 'value');
      expect(Object.keys(component.serviceProviderConfig())).toHaveLength(0);

      component.serviceProviderConfig.set({});
      component.addServiceProviderConfig('key', '');
      expect(Object.keys(component.serviceProviderConfig())).toHaveLength(0);
    });
  });

  describe('switchIsActive', () => {
    it('should toggle isActive property', () => {
      const initialState = component.isActive();

      component.switchIsActive();
      expect(component.isActive()).toBe(!initialState);
      expect(component.LuigiClient().publishEvent).toHaveBeenCalled();
    });

    it('should publish event with localDevelopmentSettings details', () => {
      component.isActive.set(true);
      component.configs.set([{ url: 'https://one.test' }]);
      component.serviceProviderConfig.set({ key1: 'value1' });

      component.switchIsActive();

      const event = luigiClientMock.publishEvent.mock.calls[0][0];
      expect(event.type).toBe('luigi.updateUserSettings');
      expect(event.detail.localDevelopmentSettings).toEqual({
        isActive: false,
        configs: [{ url: 'https://one.test' }],
        serviceProviderConfig: { key1: 'value1' },
      });
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
      const translations = (component as any).texts();

      expect(translations.explanation).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_EXPLANATION',
      );
      expect(translations.link).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_LINK',
      );
      expect(translations.addButton).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_ADD_BUTTON',
      );
      expect(translations.clearButton).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_CLEAR_BUTTON',
      );
      expect(translations.removeButton).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_REMOVE_BUTTON',
      );
      expect(translations.isDevelopmentModeActive).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_IS_ACTIVE',
      );
      expect(translations.urlsInput.title).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_TITLE',
      );
      expect(translations.urlsInput.label).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_LABEL',
      );
      expect(translations.urlsInput.error).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_ERROR',
      );
      expect(translations.serviceProviderConfig.title).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_TITLE',
      );
      expect(translations.serviceProviderConfig.explanation).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_EXPLANATION',
      );
      expect(translations.serviceProviderConfig.keyInput.label).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_LABEL',
      );
      expect(translations.serviceProviderConfig.keyInput.placeholder).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_PLACEHOLDER',
      );
      expect(translations.serviceProviderConfig.valueInput.label).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_LABEL',
      );
      expect(translations.serviceProviderConfig.valueInput.placeholder).toBe(
        'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_PLACEHOLDER',
      );
    });
  });

  describe('context input', () => {
    it('should set translation table and update texts when context is provided', () => {
      const mockContext = {
        translationTable: {
          key1: 'value1',
          key2: 'value2',
        },
      };

      fixture.componentRef.setInput('context', mockContext);
      fixture.detectChanges();

      const texts = (component as any).texts();
      expect(texts).toBeDefined();
      expect(i18nServiceMock.getTranslation).toHaveBeenCalled();
    });

    it('should handle empty translation table', () => {
      const mockContext = {
        translationTable: {},
      };

      fixture.componentRef.setInput('context', mockContext);
      fixture.detectChanges();

      expect((component as any).texts).toBeDefined();
    });

    it('should handle undefined translation table', () => {
      const mockContext = {
        translationTable: undefined,
      };

      fixture.componentRef.setInput('context', mockContext);
      fixture.detectChanges();

      expect((component as any).texts).toBeDefined();
    });

    it('should update texts with all required translations', () => {
      const mockContext = {
        translationTable: {
          LOCAL_DEVELOPMENT_SETTINGS_EXPLANATION: 'explanation',
          LOCAL_DEVELOPMENT_SETTINGS_LINK: 'link',
          LOCAL_DEVELOPMENT_SETTINGS_ADD_BUTTON: 'add',
          LOCAL_DEVELOPMENT_SETTINGS_CLEAR_BUTTON: 'clear',
          LOCAL_DEVELOPMENT_SETTINGS_REMOVE_BUTTON: 'remove',
          LOCAL_DEVELOPMENT_SETTINGS_IS_ACTIVE: 'active',
          LOCAL_DEVELOPMENT_SETTINGS_URLS_TITLE: 'urls title',
          LOCAL_DEVELOPMENT_SETTINGS_URLS_LABEL: 'urls label',
          LOCAL_DEVELOPMENT_SETTINGS_URLS_ERROR: 'urls error',
          LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_TITLE: 'provider title',
          LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_EXPLANATION:
            'provider explanation',
          LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_LABEL:
            'key label',
          LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_PLACEHOLDER:
            'key placeholder',
          LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_LABEL:
            'value label',
          LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_PLACEHOLDER:
            'value placeholder',
        },
      };

      fixture.componentRef.setInput('context', mockContext);
      fixture.detectChanges();

      expect((component as any).texts()).toEqual({
        explanation: 'translated_LOCAL_DEVELOPMENT_SETTINGS_EXPLANATION',
        link: 'translated_LOCAL_DEVELOPMENT_SETTINGS_LINK',
        addButton: 'translated_LOCAL_DEVELOPMENT_SETTINGS_ADD_BUTTON',
        clearButton: 'translated_LOCAL_DEVELOPMENT_SETTINGS_CLEAR_BUTTON',
        removeButton: 'translated_LOCAL_DEVELOPMENT_SETTINGS_REMOVE_BUTTON',
        isDevelopmentModeActive:
          'translated_LOCAL_DEVELOPMENT_SETTINGS_IS_ACTIVE',
        urlsInput: {
          title: 'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_TITLE',
          label: 'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_LABEL',
          error: 'translated_LOCAL_DEVELOPMENT_SETTINGS_URLS_ERROR',
        },
        serviceProviderConfig: {
          title: 'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_TITLE',
          explanation:
            'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_EXPLANATION',
          keyInput: {
            label:
              'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_LABEL',
            placeholder:
              'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_KEY_INPUT_PLACEHOLDER',
          },
          valueInput: {
            label:
              'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_LABEL',
            placeholder:
              'translated_LOCAL_DEVELOPMENT_SETTINGS_SERVICE_PROVIDER_VALUE_INPUT_PLACEHOLDER',
          },
        },
      });
    });
  });
});

import { FeatureToggleComponent } from './feature-toggle.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { I18nService, featureToggleLocalStorage } from '@openmfp/portal-ui-lib';
import { MockedObject } from 'vitest';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '?ft=feature1,feature2&other=value',
  },
  writable: true,
});

describe('FeatureToggleComponent', () => {
  let component: FeatureToggleComponent;
  let fixture: ComponentFixture<FeatureToggleComponent>;
  let mockLuigiClient: any;
  let i18nServiceMock: MockedObject<I18nService>;

  beforeEach(async () => {
    i18nServiceMock = {
      getTranslation: vi.fn((key) => `translated_${key}`),
      translationTable: {},
    } as any;

    mockLuigiClient = {
      getActiveFeatureToggles: vi
        .fn()
        .mockReturnValue(['feature1', 'feature2']),
      publishEvent: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FeatureToggleComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: I18nService, useValue: i18nServiceMock }],
    })
      .overrideComponent(FeatureToggleComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FeatureToggleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('LuigiClient', mockLuigiClient);
    fixture.componentRef.setInput('context', { translationTable: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize feature toggles from localStorage and LuigiClient', () => {
      const mockSettings = { feature1: false, feature2: true };
      vi.spyOn(featureToggleLocalStorage, 'read').mockReturnValue(mockSettings);
      vi.spyOn(featureToggleLocalStorage, 'store').mockImplementation(() => {});

      component.ngOnInit();

      expect(featureToggleLocalStorage.read).toHaveBeenCalled();
      expect(mockLuigiClient.getActiveFeatureToggles).toHaveBeenCalled();
      expect(featureToggleLocalStorage.store).toHaveBeenCalled();
    });

    it('should disable controls for features from query params', () => {
      const mockSettings = { feature1: false, feature2: true };
      vi.spyOn(featureToggleLocalStorage, 'read').mockReturnValue(mockSettings);
      vi.spyOn(featureToggleLocalStorage, 'store').mockImplementation(() => {});

      component.ngOnInit();

      expect(component.togglesForm.get('feature1')?.disabled).toBe(true);
      expect(component.togglesForm.get('feature2')?.disabled).toBe(true);
    });

    it('should keep controls enabled when not in query params', () => {
      const mockSettings = { feature1: true, feature2: true };
      vi.spyOn(featureToggleLocalStorage, 'read').mockReturnValue(mockSettings);
      vi.spyOn(featureToggleLocalStorage, 'store').mockImplementation(() => {});
      component.queryParamsFeatures = [];

      component.ngOnInit();

      expect(component.togglesForm.get('feature1')?.disabled).toBe(false);
      expect(component.togglesForm.get('feature2')?.disabled).toBe(false);
      expect(featureToggleLocalStorage.store).toHaveBeenCalledWith(
        mockSettings,
      );
    });

    it('should add missing active toggles as enabled and store them', () => {
      const mockSettings = { feature1: false };
      vi.spyOn(featureToggleLocalStorage, 'read').mockReturnValue(mockSettings);
      vi.spyOn(featureToggleLocalStorage, 'store').mockImplementation(() => {});

      component.ngOnInit();

      expect(component.togglesForm.get('feature2')?.value).toBe(true);
      expect(featureToggleLocalStorage.store).toHaveBeenCalledWith({
        feature1: true,
        feature2: true,
      });
    });
  });

  describe('addToggle', () => {
    it('should add new toggle control', () => {
      component.newToggleControl.setValue('newFeature');

      component.addToggle();

      expect(component.togglesForm.get('newFeature')).toBeTruthy();
      expect(component.newToggleControl.value).toBe('');
    });

    it('should not add duplicate toggle', () => {
      component.togglesForm.addControl(
        'existingFeature',
        new FormControl(false),
      );
      component.newToggleControl.setValue('existingFeature');

      component.addToggle();

      expect(component.togglesForm.get('existingFeature')?.value).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset new toggle control', () => {
      component.newToggleControl.setValue('test');

      component.clear();

      expect(component.newToggleControl.value).toBe('');
    });
  });

  describe('onItemDelete', () => {
    it('should remove toggle control', () => {
      component.togglesForm.addControl('testFeature', new FormControl(true));

      component.onItemDelete('testFeature');

      expect(component.togglesForm.get('testFeature')).toBeFalsy();
    });
  });

  describe('onToggleChange', () => {
    it('should invert toggle value from false to true', () => {
      component.togglesForm.addControl('testFeature', new FormControl(false));

      component.onToggleChange('testFeature');

      expect(component.togglesForm.get('testFeature')?.value).toBe(true);
    });

    it('should invert toggle value from true to false', () => {
      component.togglesForm.addControl('testFeature', new FormControl(true));

      component.onToggleChange('testFeature');

      expect(component.togglesForm.get('testFeature')?.value).toBe(false);
    });
  });

  describe('extractFeatureToggleValues', () => {
    it('should extract feature toggle values from query string', () => {
      const result = component['extractFeatureToggleValues'](
        '?ft=feature1,feature2&ft=feature3',
      );

      expect(result).toEqual(['feature1', 'feature2', 'feature3']);
    });

    it('should return empty array for empty query string', () => {
      const result = component['extractFeatureToggleValues']('');

      expect(result).toEqual([]);
    });
  });

  describe('saveFeatureToggleSettings', () => {
    it('should publish event with form values', () => {
      component.togglesForm.addControl('testFeature', new FormControl(true));

      component['saveFeatureToggleSettings']();

      expect(mockLuigiClient.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'luigi.updateUserSettings',
          detail: {
            featureToggleSettings: { testFeature: true },
          },
        }),
      );
    });

    it('should publish event when togglesForm changes', () => {
      component.togglesForm.addControl('testFeature', new FormControl(true), {
        emitEvent: false,
      });
      mockLuigiClient.publishEvent.mockClear();

      const control = component.togglesForm.get(
        'testFeature',
      ) as unknown as FormControl<boolean>;
      control.setValue(false);

      expect(mockLuigiClient.publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'luigi.updateUserSettings',
          detail: {
            featureToggleSettings: { testFeature: false },
          },
        }),
      );
    });
  });

  describe('readTranslations', () => {
    it('should update texts and translationTable from context', () => {
      const context = {
        translationTable: {
          FEATURE_TOGGLE_SETTINGS_EXPLANATION: 'explanation',
          FEATURE_TOGGLE_SETTINGS_LINK: 'link',
          FEATURE_TOGGLE_SETTINGS_ADD_BUTTON: 'add',
          FEATURE_TOGGLE_SETTINGS_CLEAR_BUTTON: 'clear',
          FEATURE_TOGGLE_SETTINGS_NAME_INPUT_LABEL: 'name',
          FEATURE_TOGGLE_SETTINGS_TOOLTIP_QUERY_PARAM: 'tooltip',
        },
      };

      fixture.componentRef.setInput('context', context);
      fixture.detectChanges();

      expect(i18nServiceMock.translationTable).toEqual(
        context.translationTable,
      );
      expect((component as any).texts).toEqual({
        explanation: 'translated_FEATURE_TOGGLE_SETTINGS_EXPLANATION',
        link: 'translated_FEATURE_TOGGLE_SETTINGS_LINK',
        addButton: 'translated_FEATURE_TOGGLE_SETTINGS_ADD_BUTTON',
        clearButton: 'translated_FEATURE_TOGGLE_SETTINGS_CLEAR_BUTTON',
        nameInputLabel: 'translated_FEATURE_TOGGLE_SETTINGS_NAME_INPUT_LABEL',
        tooltipQueryParam:
          'translated_FEATURE_TOGGLE_SETTINGS_TOOLTIP_QUERY_PARAM',
      });
    });
  });
});

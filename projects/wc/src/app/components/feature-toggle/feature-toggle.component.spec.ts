import { FeatureToggleComponent } from './feature-toggle.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { I18nService, featureToggleLocalStorage } from '@openmfp/portal-ui-lib';

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
  let i18nServiceMock: jest.Mocked<I18nService>;

  beforeEach(async () => {
    i18nServiceMock = {
      getTranslation: jest.fn((key) => `translated_${key}`),
      translationTable: {},
    } as any;

    mockLuigiClient = {
      getActiveFeatureToggles: jest
        .fn()
        .mockReturnValue(['feature1', 'feature2']),
      publishEvent: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize feature toggles from localStorage and LuigiClient', () => {
      const mockSettings = { feature1: false, feature2: true };
      jest
        .spyOn(featureToggleLocalStorage, 'read')
        .mockReturnValue(mockSettings);
      jest.spyOn(featureToggleLocalStorage, 'store').mockImplementation();

      component.ngOnInit();

      expect(featureToggleLocalStorage.read).toHaveBeenCalled();
      expect(mockLuigiClient.getActiveFeatureToggles).toHaveBeenCalled();
      expect(featureToggleLocalStorage.store).toHaveBeenCalled();
    });

    it('should disable controls for features from query params', () => {
      const mockSettings = { feature1: false, feature2: true };
      jest
        .spyOn(featureToggleLocalStorage, 'read')
        .mockReturnValue(mockSettings);
      jest.spyOn(featureToggleLocalStorage, 'store').mockImplementation();

      component.ngOnInit();

      expect(component.togglesForm.get('feature1')?.disabled).toBe(true);
      expect(component.togglesForm.get('feature2')?.disabled).toBe(true);
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
  });
});

import { I18nService, LuigiCoreService } from '../../services';
import { ErrorScreenComponent } from './error-screen.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

const NOT_FOUND_DATA = {
  icon: 'sap-icon--search',
  titleKey: 'ERROR_NOT_FOUND_TITLE',
  subtitleKey: 'ERROR_NOT_FOUND_SUBTITLE',
  expandedByDefault: false,
};
const NOT_AUTHORIZED_DATA = {
  icon: 'sap-icon--locked',
  titleKey: 'ERROR_NOT_AUTHORIZED_TITLE',
  subtitleKey: 'ERROR_NOT_AUTHORIZED_SUBTITLE',
  expandedByDefault: false,
};
const UNEXPECTED_DATA = {
  icon: 'sap-icon--alert',
  titleKey: 'ERROR_UNEXPECTED_TITLE',
  subtitleKey: 'ERROR_UNEXPECTED_SUBTITLE',
  expandedByDefault: true,
};

function buildTestBed(
  routeData: Record<string, unknown>,
  queryParams: Record<string, string> = {},
) {
  const mockRoute: ActivatedRoute = {
    snapshot: { data: routeData, queryParams },
  } as any;
  const mockRouter = { navigate: vi.fn() };
  const mockLuigiCoreService = {
    ux: vi.fn(() => ({ hideAppLoadingIndicator: vi.fn() })),
  };
  const mockI18nService = {
    getTranslationAsync: vi
      .fn()
      .mockImplementation((key: string) => Promise.resolve(key + '_translated')),
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: ActivatedRoute, useValue: mockRoute },
      { provide: Router, useValue: mockRouter },
      { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      { provide: I18nService, useValue: mockI18nService },
    ],
  });

  return { mockRoute, mockRouter, mockLuigiCoreService, mockI18nService };
}

describe('ErrorScreenComponent', () => {
  let component: ErrorScreenComponent;
  let fixture: ComponentFixture<ErrorScreenComponent>;

  describe('not-found configuration', () => {
    let mockLuigiCoreService: { ux: ReturnType<typeof vi.fn> };
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockI18nService: { getTranslationAsync: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      ({ mockLuigiCoreService, mockRouter, mockI18nService } = buildTestBed(
        NOT_FOUND_DATA,
      ));
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call hideAppLoadingIndicator on init', () => {
      expect(mockLuigiCoreService.ux).toHaveBeenCalled();
    });

    it('should set icon from route data', async () => {
      await component.ngOnInit();
      expect(component.icon()).toBe('sap-icon--search');
    });

    it('should set expandedByDefault to false', async () => {
      await component.ngOnInit();
      expect(component.expandedByDefault()).toBe(false);
    });

    it('should set empty code when no query param provided', async () => {
      await component.ngOnInit();
      expect(component.code()).toBe('');
    });

    it('should request correct i18n keys for not-found', async () => {
      await component.ngOnInit();
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_NOT_FOUND_TITLE',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_NOT_FOUND_SUBTITLE',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_GO_HOME_BUTTON',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_DETAILS_LABEL',
      );
    });

    it('should set title, subtitle, buttonText, errorDetailsLabel from translations', async () => {
      await component.ngOnInit();
      expect(component.title()).toBe('ERROR_NOT_FOUND_TITLE_translated');
      expect(component.subtitle()).toBe('ERROR_NOT_FOUND_SUBTITLE_translated');
      expect(component.buttonText()).toBe('ERROR_GO_HOME_BUTTON_translated');
      expect(component.errorDetailsLabel()).toBe('ERROR_DETAILS_LABEL_translated');
    });

    it('should navigate to / when goHome() is called', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('not-authorized configuration', () => {
    let mockLuigiCoreService: { ux: ReturnType<typeof vi.fn> };
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockI18nService: { getTranslationAsync: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      ({ mockLuigiCoreService, mockRouter, mockI18nService } = buildTestBed(
        NOT_AUTHORIZED_DATA,
      ));
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call hideAppLoadingIndicator on init', () => {
      expect(mockLuigiCoreService.ux).toHaveBeenCalled();
    });

    it('should set icon from route data', async () => {
      await component.ngOnInit();
      expect(component.icon()).toBe('sap-icon--locked');
    });

    it('should set expandedByDefault to false', async () => {
      await component.ngOnInit();
      expect(component.expandedByDefault()).toBe(false);
    });

    it('should request correct i18n keys for not-authorized', async () => {
      await component.ngOnInit();
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_NOT_AUTHORIZED_TITLE',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_NOT_AUTHORIZED_SUBTITLE',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_GO_HOME_BUTTON',
      );
    });

    it('should set title, subtitle, buttonText from translations', async () => {
      await component.ngOnInit();
      expect(component.title()).toBe('ERROR_NOT_AUTHORIZED_TITLE_translated');
      expect(component.subtitle()).toBe(
        'ERROR_NOT_AUTHORIZED_SUBTITLE_translated',
      );
      expect(component.buttonText()).toBe('ERROR_GO_HOME_BUTTON_translated');
    });

    it('should navigate to / when goHome() is called', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('unexpected-error configuration', () => {
    let mockLuigiCoreService: { ux: ReturnType<typeof vi.fn> };
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockI18nService: { getTranslationAsync: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      ({ mockLuigiCoreService, mockRouter, mockI18nService } = buildTestBed(
        UNEXPECTED_DATA,
      ));
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call hideAppLoadingIndicator on init', () => {
      expect(mockLuigiCoreService.ux).toHaveBeenCalled();
    });

    it('should set icon from route data', async () => {
      await component.ngOnInit();
      expect(component.icon()).toBe('sap-icon--alert');
    });

    it('should set expandedByDefault to true', async () => {
      await component.ngOnInit();
      expect(component.expandedByDefault()).toBe(true);
    });

    it('should request correct i18n keys for unexpected-error', async () => {
      await component.ngOnInit();
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_UNEXPECTED_TITLE',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_UNEXPECTED_SUBTITLE',
      );
      expect(mockI18nService.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_GO_HOME_BUTTON',
      );
    });

    it('should set title, subtitle, buttonText from translations', async () => {
      await component.ngOnInit();
      expect(component.title()).toBe('ERROR_UNEXPECTED_TITLE_translated');
      expect(component.subtitle()).toBe('ERROR_UNEXPECTED_SUBTITLE_translated');
      expect(component.buttonText()).toBe('ERROR_GO_HOME_BUTTON_translated');
    });

    it('should navigate to / when goHome() is called', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('error code via query param', () => {
    it('should display code when ?code= query param is provided', async () => {
      buildTestBed(UNEXPECTED_DATA, { code: '500' });
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      await component.ngOnInit();

      expect(component.code()).toBe('500');
    });

    it('should display string error code', async () => {
      buildTestBed(NOT_FOUND_DATA, { code: 'ERR_NOT_FOUND' });
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      await component.ngOnInit();

      expect(component.code()).toBe('ERR_NOT_FOUND');
    });

    it('should have empty code when no query param provided', async () => {
      buildTestBed(UNEXPECTED_DATA);
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      await component.ngOnInit();

      expect(component.code()).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle missing route data gracefully', async () => {
      buildTestBed({});
      await TestBed.compileComponents();
      fixture = TestBed.createComponent(ErrorScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      await component.ngOnInit();

      expect(component.icon()).toBe('');
      expect(component.expandedByDefault()).toBe(false);
      expect(component.code()).toBe('');
    });
  });
});

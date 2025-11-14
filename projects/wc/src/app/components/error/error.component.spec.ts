import { ErrorComponent } from './error.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ButtonConfig,
  I18nService,
  LuigiCoreService,
} from '@openmfp/portal-ui-lib';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;

  beforeEach(async () => {
    i18nServiceMock = {
      getTranslationAsync: jest.fn().mockResolvedValue('translated text'),
      translationTable: {},
    } as any;

    luigiCoreServiceMock = {
      navigation: jest.fn().mockReturnValue({
        navigate: jest.fn(),
      }),
      showAlert: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ErrorComponent],
      providers: [
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goTo', () => {
    it('should open URL in new tab', () => {
      const windowSpy = jest.spyOn(window, 'open').mockImplementation();
      const button: ButtonConfig = { url: 'https://test.com' };

      component.goTo(button);
      expect(windowSpy).toHaveBeenCalledWith('https://test.com', '_blank');
    });

    it('should navigate using LuigiCore when route is provided', () => {
      const button: ButtonConfig = { route: { context: 'test-route' } };
      const navigateSpy = jest.fn();
      jest
        .spyOn(luigiCoreServiceMock, 'navigation')
        .mockReturnValue({ navigate: navigateSpy });

      component.goTo(button);
      expect(navigateSpy).toHaveBeenCalledWith('/test-route');
    });
  });

  describe('setSceneConfig', () => {
    it('should set entity 404 config', async () => {
      const testContext = {
        error: {
          code: 404,
          entityDefinition: {
            label: 'Test',
            pluralLabel: 'Tests',
            notFoundConfig: {
              sapIllusSVG: 'test-scene',
              entityListNavigationContext: 'test-context',
            },
            dynamicFetchId: 'testId',
          },
          additionalContext: {
            testId: 'TEST-123',
          },
        },
        translationTable: {},
      };

      fixture.componentRef.setInput('context', testContext);
      await component.ngOnInit();
      expect(component.config.sceneConfig?.scene.id).toBe(
        'sapIllus-test-scene',
      );
    });

    it('should set entity 403 config', async () => {
      const testContext = {
        error: {
          code: 403,
          entityDefinition: {
            label: 'Test',
          },
        },
        translationTable: {},
      };

      fixture.componentRef.setInput('context', testContext);

      await component.ngOnInit();
      expect(component.config.sceneConfig?.scene.id).toBe(
        'tnt-Scene-UnsuccessfulAuth',
      );
    });

    it('should set entity default error config', async () => {
      const testContext = {
        error: {
          code: 500,
          entityDefinition: {
            label: 'Test',
          },
        },
        translationTable: {},
      };

      fixture.componentRef.setInput('context', testContext);

      await component.ngOnInit();
      expect(component.config.sceneConfig?.scene.id).toBe('');
    });

    it('should set non-entity 404 config', async () => {
      const testContext = {
        error: {
          code: 404,
          errorComponentConfig: {
            '404': {
              buttons: [{ url: 'test-url', label: 'test-label' }],
            },
          },
        },
        translationTable: {},
      };

      fixture.componentRef.setInput('context', testContext);

      await component.ngOnInit();
      expect(component.config.sceneConfig?.scene.id).toBe(
        'sapIllus-Scene-NoEntries',
      );
    });

    it('should set non-entity 403 config', async () => {
      const testContext = {
        error: {
          code: 403,
        },
        translationTable: {},
      };

      fixture.componentRef.setInput('context', testContext);

      await component.ngOnInit();
      expect(component.config.sceneConfig?.scene.id).toBe(
        'tnt-Scene-UnsuccessfulAuth',
      );
    });

    it('should set default error config for unknown error code', async () => {
      const testContext = {
        error: {
          code: 500,
        },
        translationTable: {},
      };

      fixture.componentRef.setInput('context', testContext);

      await component.ngOnInit();
      expect(component.config.sceneConfig?.scene.id).toBe('');
    });
  });
});

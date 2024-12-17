import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ERROR_COMPONENT_CONFIG } from '../../injection-tokens';
import { ErrorComponentConfig } from '../../models';
import { ErrorComponent } from './error.component';
import { I18nService, LuigiCoreService } from '../../services';
import * as LuigiClient from '@luigi-project/client/luigi-client';

const fromContextMock = jest.fn().mockReturnThis();
const navigateMock = jest.fn();

jest.mock('@luigi-project/client/luigi-client', () => ({
  addInitListener: jest.fn(),
  linkManager: jest.fn(() => ({
    fromContext: fromContextMock,
    navigate: navigateMock,
  })),
}));

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let i18nServiceMock: jest.Mocked<I18nService>;
  let locationSpy: jest.SpyInstance;
  let errorComponentConfig: Record<string, ErrorComponentConfig>;

  beforeEach(async () => {
    errorComponentConfig = {};
    locationSpy = jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
      hash: '#404',
    } as Location);

    i18nServiceMock = {
      getTranslationAsync: jest.fn().mockResolvedValue('Mocked Translation'),
      afterInit: jest.fn(),
    } as any;

    luigiCoreServiceMock = {
      ux: jest.fn().mockReturnValue({
        hideAppLoadingIndicator: jest.fn(),
      }),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ErrorComponent],
      providers: [
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
        { provide: ERROR_COMPONENT_CONFIG, useValue: errorComponentConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should hide app loading indicator', async () => {
      await component.ngAfterViewInit();
      expect(
        luigiCoreServiceMock.ux().hideAppLoadingIndicator
      ).toHaveBeenCalled();
    });

    it('should process hash without additional data', async () => {
      await component.ngAfterViewInit();
      expect(component.errorCode).toBe('404');
    });

    it('should handle complex hash with multiple segments', async () => {
      locationSpy.mockReturnValue({ hash: '#404/additional' });
      await component.ngAfterViewInit();
      expect(component.errorCode).toBe('404');
    });

    it('should handle entity error scenario', async () => {
      component.errorCode = 'entity_404';
      locationSpy = jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
        hash: '#entity_404',
      } as Location);

      const addInitListenerMock = LuigiClient.addInitListener as jest.Mock;
      addInitListenerMock.mockImplementation((callback) => {
        callback({
          error: {
            entityDefinition: {
              dynamicFetchId: 'testId',
              label: 'TestEntity',
              pluralLabel: 'TestEntities',
              notFoundConfig: { portalIllusSVG: 'TestScene' },
            },
            additionalContext: { testId: '123' },
          },
        });
      });

      await component.ngAfterViewInit();
      expect(addInitListenerMock).toHaveBeenCalled();
    });
  });

  describe('goTo', () => {
    it('should open external URL', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();
      const button = { url: 'https://example.com' };

      component.goTo(button);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://example.com',
        '_blank'
      );
      windowOpenSpy.mockRestore();
    });

    it('should navigate to route', () => {
      const button = { route: { context: 'testContext' } };

      component.goTo(button);

      const linkManagerMock = LuigiClient.linkManager as jest.Mock;
      expect(fromContextMock).toHaveBeenCalledWith('testContext');
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  describe('error handling', () => {
    it('should get 404 config', async () => {
      const config = await (component as any).getError404Config();

      expect(config.sceneConfig.scene.id).toBe('sapIllus-Scene-NoEntries');
      expect(config.buttons).toEqual([]);
      expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_CONTENT_NOT_FOUND_TITLE'
      );
      expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_CONTENT_NOT_FOUND_TEXT'
      );
    });

    it('should get 404 config with buttons from external config', async () => {
      errorComponentConfig['404'] = {
        buttons: [{ url: 'url', label: 'LABEL' }],
      };

      i18nServiceMock.getTranslationAsync.mockResolvedValue('btn-label');
      const config = await (component as any).getError404Config();

      expect(config.sceneConfig.scene.id).toBe('sapIllus-Scene-NoEntries');
      expect(config.buttons).toEqual([{ url: 'url', label: 'btn-label' }]);
      expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith('LABEL');
      expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_CONTENT_NOT_FOUND_TITLE'
      );
      expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_CONTENT_NOT_FOUND_TEXT'
      );
    });

    it('should get 403 config', async () => {
      const config = await (component as any).getError403Config();

      expect(config.sceneConfig.scene.id).toBe('tnt-Scene-UnsuccessfulAuth');
      expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith(
        'ERROR_CONTENT_NOT_ALLOWED_NO_PROJECT_MEMBER_TEXT'
      );
    });

    it('should get default error config', async () => {
      const config = await (component as any).getErrorDefaultConfig();

      expect(config.illustratedMessageTitle).toBe('Mocked Translation');
      expect(config.buttons).toHaveLength(0);
    });

    it('should handle 403 error code with includes check', async () => {
      locationSpy.mockReturnValue({ hash: '#403/something' });
      component.errorCode = '403';

      await component.ngAfterViewInit();

      expect(component.config.sceneConfig.scene.id).toBe(
        'tnt-Scene-UnsuccessfulAuth'
      );
    });

    it('should handle default error for unrecognized error code', async () => {
      locationSpy.mockReturnValue({ hash: '#500' });
      component.errorCode = '500';

      await component.ngAfterViewInit();

      expect(component.config.illustratedMessageTitle).toBe(
        'Mocked Translation'
      );
      expect(component.config.buttons).toHaveLength(0);
    });
  });

  describe('entity error handling', () => {
    it('entity_404 should add view all button when gotoNavContext and typeStrPlural exist', async () => {
      component.errorCode = 'entity_404';

      jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
        hash: '#entity_404',
      } as Location);

      const mockContext = {
        error: {
          entityDefinition: {
            dynamicFetchId: 'testId',
            label: 'TestEntity',
            pluralLabel: 'TestEntities',
            notFoundConfig: {
              sapIllusSVG: 'TestScene',
              entityListNavigationContext: 'listContext',
            },
          },
          additionalContext: { testId: '123' },
        },
      };

      const addInitListenerMock = LuigiClient.addInitListener as jest.Mock;
      addInitListenerMock.mockImplementation((callback) => {
        callback(mockContext);
      });

      i18nServiceMock.getTranslationAsync.mockImplementation(
        async (key, params) => {
          if (key === 'ERROR_ENTITY_VIEW_ALL_BUTTON') {
            return 'View All Entities';
          }
          return key;
        }
      );

      await component.ngAfterViewInit();

      setTimeout(() => {
        expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledTimes(3);
        expect(i18nServiceMock.getTranslationAsync).toHaveBeenCalledWith(
          'ERROR_ENTITY_VIEW_ALL_BUTTON',
          { entityTypePlural: 'TestEntities' }
        );

        expect(component.config.buttons.length).toBeGreaterThan(0);
        expect(component.config.buttons[0]).toEqual(
          expect.objectContaining({
            route: { context: 'listContext' },
            label: 'View All Entities',
          })
        );
      });
    });

    it('entity_404 should not add view all button when gotoNavContext is missing', async () => {
      component.errorCode = 'entity_404';
      locationSpy = jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
        hash: '#entity_404',
      } as Location);
      const mockContext = {
        error: {
          entityDefinition: {
            dynamicFetchId: 'testId',
            label: 'TestEntity',
            pluralLabel: 'TestEntities',
            notFoundConfig: { sapIllusSVG: 'TestScene' },
          },
          additionalContext: { testId: '123' },
        },
      };

      const addInitListenerMock = LuigiClient.addInitListener as jest.Mock;
      addInitListenerMock.mockImplementation((callback) => {
        callback(mockContext);
      });

      await component.ngAfterViewInit();

      expect(component.config.buttons).toHaveLength(0);
    });

    it('entity_403 should add proper scene id', async () => {
      component.errorCode = 'entity_403';

      jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
        hash: '#entity_403',
      } as Location);

      const mockContext = {
        error: {
          additionalContext: { testId: '123' },
        },
      };

      const addInitListenerMock = LuigiClient.addInitListener as jest.Mock;
      addInitListenerMock.mockImplementation((callback) => {
        callback(mockContext);
      });

      await component.ngAfterViewInit();

      setTimeout(() => {
        expect(component.config.sceneConfig.scene.id).toBe(
          'tnt-Scene-UnsuccessfulAuth'
        );
      });
    });

    it('entity_500 should add proper scene id', async () => {
      component.errorCode = 'entity_500';

      jest.spyOn(globalThis, 'location', 'get').mockReturnValue({
        hash: '#entity_500',
      } as Location);

      const mockContext = {
        error: {
          additionalContext: { testId: '123' },
        },
      };

      const addInitListenerMock = LuigiClient.addInitListener as jest.Mock;
      addInitListenerMock.mockImplementation((callback) => {
        callback(mockContext);
      });

      await component.ngAfterViewInit();

      setTimeout(() => {
        expect(component.config.sceneConfig.scene.id).toBe('');
      });
    });
  });
});

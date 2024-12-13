jest.mock('@luigi-project/client/luigi-client', () => ({
  __esModule: true, // this property makes it work
  default: 'mockedDefaultExport',
  getContext: jest.fn(),
  addInitListener: jest.fn(),
  linkManager: jest.fn(),
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core';
import { LuigiCoreService, I18nService } from '@openmfp/portal-ui-lib';
import { MockProvider } from 'ng-mocks';
import { ErrorComponent } from './error.component';
import { addInitListener } from '@luigi-project/client/luigi-client';
import { linkManager } from '@luigi-project/client';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let luigiCoreServiceMock: Partial<LuigiCoreService>;
  let locationSpy;

  beforeEach(async () => {
    locationSpy = jest.spyOn(globalThis, 'location', 'get');

    await TestBed.configureTestingModule({
      providers: [
        MockProvider(LuigiCoreService, {
          ux: jest.fn().mockReturnValue({ hideAppLoadingIndicator: jest.fn() }),
        }),
        MockProvider(I18nService, {
          getTranslationAsync: jest
            .fn()
            .mockImplementation((key, interpolations) => {
              return JSON.stringify({
                key,
                interpolations,
              });
            }),
        }),
      ],
      imports: [FundamentalNgxCoreModule],
    }).compileComponents();

    luigiCoreServiceMock = TestBed.inject(LuigiCoreService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit simple', () => {
    beforeEach(async () => {
      locationSpy.mockReturnValue({ hash: '#404' } as Location);
      await component.ngAfterViewInit();
    });

    it('should set errorCode', () => {
      expect(component.errorCode).toEqual('404');
      expect(addInitListener).not.toHaveBeenCalled();
    });

    it('should set sceneConfig', () => {
      expect(component.config.sceneConfig.scene.id).toEqual(
        'sapIllus-Scene-NoEntries',
      );
      expect(component.config.illustratedMessageTitle).toBeDefined();
    });

    it('should hide appLoadingIndicator', () => {
      expect(
        luigiCoreServiceMock.ux().hideAppLoadingIndicator,
      ).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit entity', () => {
    let initListenerFn;
    beforeEach(async () => {
      locationSpy.mockReturnValue({ hash: '#entity_404' } as Location);
      (addInitListener as any).mockImplementation((fn) => {
        initListenerFn = fn;
      });
      await component.ngAfterViewInit();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should set errorCode and add initListener to get additional info in context', () => {
      expect(component.errorCode).toEqual('entity_404');
      expect(addInitListener).toHaveBeenCalled();
      expect(component.config.sceneConfig.scene.id).toEqual('');
    });

    it('should hide appLoadingIndicator', () => {
      expect(
        luigiCoreServiceMock.ux().hideAppLoadingIndicator,
      ).toHaveBeenCalled();
    });

    it('should load entity scene config, full config', async () => {
      const ctx = {
        error: {
          additionalContext: {
            myEntity: 'ent1234',
          },
          entityDefinition: {
            dynamicFetchId: 'myEntity',
            label: 'My Entity',
            pluralLabel: 'My Entities',
            notFoundConfig: {
              sapIllusSVG: 'bla',
              entityListNavigationContext: 'myEntitiesNavCTX',
            },
          },
        },
      };
      await initListenerFn(ctx);

      expect(component.entityNotFoundError).toEqual(ctx.error);
      expect(component.config.sceneConfig.scene.id).toEqual('sapIllus-bla');
      expect(component.config.sceneConfig.scene.url).toEqual(
        'assets/moments/sapIllus-bla.svg',
      );

      expect(component.config.buttons.length).toEqual(1);
      expect(component.config.buttons[0].route.context).toEqual(
        'myEntitiesNavCTX',
      );
      expect(JSON.parse(component.config.buttons[0].label)).toEqual({
        key: 'ERROR_ENTITY_VIEW_ALL_BUTTON',
        interpolations: {
          entityTypePlural: 'My Entities',
        },
      });

      expect(JSON.parse(component.config.illustratedMessageTitle)).toEqual({
        key: 'ERROR_ENTITY_NOT_FOUND_TITLE',
        interpolations: { entityType: 'My Entity', entityId: `<b>ent1234</b>` },
      });
      expect(JSON.parse(component.config.illustratedMessageText)).toEqual({
        key: 'ERROR_ENTITY_NOT_FOUND_TEXT_LIST',
        interpolations: {
          entityTypePlural: 'My Entities',
          entityTypePlural_lowerCase: 'my entities',
        },
      });
    });

    it('should load entity scene config, no nav context', async () => {
      const ctx = {
        error: {
          additionalContext: {
            myEntity: 'ent1234',
          },
          entityDefinition: {
            dynamicFetchId: 'myEntity',
            label: 'My Entity',
            pluralLabel: 'My Entities',
            notFoundConfig: {
              sapIllusSVG: 'bla',
            },
          },
        },
      };
      await initListenerFn(ctx);

      expect(component.config.buttons.length).toEqual(0);
    });

    it('should load entity scene config, no type plural label', async () => {
      const ctx = {
        error: {
          additionalContext: {
            myEntity: 'ent1234',
          },
          entityDefinition: {
            dynamicFetchId: 'myEntity',
            label: 'My Entity',
            notFoundConfig: {
              sapIllusSVG: 'bla',
              entityListNavigationContext: 'myEntitiesNavCTX',
            },
          },
        },
      };
      await initListenerFn(ctx);

      expect(component.config.buttons.length).toEqual(0);
      expect(JSON.parse(component.config.illustratedMessageText)).toEqual({
        key: 'ERROR_ENTITY_NOT_FOUND_TEXT_NO_LIST',
      });
    });
  });

  describe('goTo', () => {
    const { open } = window;
    let linkMgrInstance;

    beforeEach(() => {
      delete window.open;
      window.open = jest.fn();
      linkMgrInstance = {
        fromContext: jest.fn().mockImplementation(() => {
          return linkMgrInstance;
        }),
        navigate: jest.fn(),
      };
      (linkManager as any).mockImplementation(() => {
        return linkMgrInstance;
      });
    });

    afterEach(() => {
      window.open = open;
      jest.restoreAllMocks();
    });

    it('should redirect to a new tab', () => {
      const link = '/error/404';

      component.goTo({ url: link });

      expect(window.open).toHaveBeenCalledWith(link, '_blank');
    });

    it('should change route to navigation context', () => {
      component.goTo({ route: { context: 'navCTX' } });

      expect(window.open).not.toHaveBeenCalled();
      expect(linkMgrInstance.fromContext).toHaveBeenCalledWith('navCTX');
      expect(linkMgrInstance.navigate).toHaveBeenCalledWith('/');
    });
  });
});

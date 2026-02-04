import { AuthData, LuigiConfig } from '../models';
import { TestBed } from '@angular/core/testing';

const luigiMock = {
  auth: vi.fn().mockReturnValue({
    store: {
      setAuthData: vi.fn(),
      getAuthData: vi.fn().mockReturnValue({
        accessTokenExpirationDate: 34,
        idToken: 'id_token_mock',
      }),
      setNewlyAuthorized: vi.fn(),
      removeAuthData: vi.fn(),
    },
  }),
  getGlobalContext: vi.fn(),
  setGlobalContext: vi.fn(),
  setConfig: vi.fn(),
  getConfig: vi.fn(),
  getConfigValue: vi.fn(),
  unload: vi.fn(),
  configChanged: vi.fn(),
  customMessages: vi.fn(),
  navigation: vi.fn(),
  reset: vi.fn(),
  clearNavigationCache: vi.fn(),
  showAlert: vi.fn(),
  ux: vi.fn(),
  theming: vi.fn(),
  i18n: vi.fn().mockReturnValue({
    setCurrentLocale: vi.fn(),
  }),
  globalSearch: vi.fn(),
  routing: vi.fn(),
  sendCustomMessage: vi.fn(),
  featureToggles: vi.fn().mockReturnValue({
    setFeatureToggle: vi.fn(),
    unsetFeatureToggle: vi.fn(),
    getActiveFeatureToggleList: vi.fn().mockReturnValue([]),
  }),
};

describe('LuigiCoreService', () => {
  let service: any;
  let LuigiCoreService: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('Luigi', luigiMock);
    const module = await import('./luigi-core.service');
    LuigiCoreService = module.LuigiCoreService;
    TestBed.configureTestingModule({
      providers: [LuigiCoreService],
    });
    service = TestBed.inject(LuigiCoreService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call setAuthData and setNewlyAuthorized', () => {
    const authData = {} as AuthData;
    service.setAuthData(authData);

    expect(luigiMock.auth).toHaveBeenCalled();
    expect(luigiMock.auth().store.setAuthData).toHaveBeenCalledWith(authData);
    expect(luigiMock.auth().store.setNewlyAuthorized).toHaveBeenCalled();
  });

  it('should call getAuthData', () => {
    const authData = service.getAuthData();

    expect(luigiMock.auth).toHaveBeenCalled();
    expect(luigiMock.auth().store.getAuthData).toHaveBeenCalled();
    expect(luigiMock.auth().store.getAuthData()).toEqual(authData);
  });

  it('should call removeAuthData', () => {
    const authData = service.removeAuthData();

    expect(luigiMock.auth).toHaveBeenCalled();
    expect(luigiMock.auth().store.removeAuthData).toHaveBeenCalled();
  });

  it('should call setConfig with correct config', () => {
    const config: LuigiConfig = {
      settings: { header: { title: 'title', logo: 'logo' } },
    };
    service.setConfig(config);
    expect(luigiMock.setConfig).toHaveBeenCalledWith(config);
  });

  it('should call getGlobalContext', () => {
    service.getGlobalContext();
    expect(luigiMock.getGlobalContext).toHaveBeenCalled();
  });

  it('should call setGlobalContext', () => {
    const ctx = {};

    service.setGlobalContext(ctx, true);

    expect(luigiMock.setGlobalContext).toHaveBeenCalledWith(ctx, true);
  });

  it('should call setGlobalContext while calling the setInGlobalContext', () => {
    const globalCtx = { globalValue: 'globalValue', toChange: 0 };
    luigiMock.getGlobalContext.mockReturnValue(globalCtx);
    const ctx = { setInGlobalContext: 'setInGlobalContext', toChange: 17 };

    service.setInGlobalContext(ctx, true);

    expect(luigiMock.setGlobalContext).toHaveBeenCalledWith(
      {
        globalValue: 'globalValue',
        setInGlobalContext: 'setInGlobalContext',
        toChange: 17,
      },
      true,
    );
  });

  it('should call getConfig', () => {
    service.config;
    expect(luigiMock.getConfig).toHaveBeenCalled();
  });

  it('should call getConfigValue with correct key', () => {
    const key = 'someKey';
    service.getConfigValue(key);
    expect(luigiMock.getConfigValue).toHaveBeenCalledWith(key);
  });

  it('should call unload', () => {
    service.unloadConfig();
    expect(luigiMock.unload).toHaveBeenCalled();
  });

  it('should call configChanged with correct scope', () => {
    const scope = 'someScope';
    service.configChanged(scope);
    expect(luigiMock.configChanged).toHaveBeenCalledWith(scope);
  });

  it('should call customMessages', () => {
    service.customMessages();
    expect(luigiMock.customMessages).toHaveBeenCalled();
  });

  it('should call navigation', () => {
    service.navigation();
    expect(luigiMock.navigation).toHaveBeenCalled();
  });

  it('should call resetLuigi', () => {
    service.resetLuigi();
    expect(luigiMock.reset).toHaveBeenCalled();
  });

  it('should call clearNavigationCache if defined', () => {
    service.clearNavigationCache();
    expect(luigiMock.clearNavigationCache).toHaveBeenCalled();
  });

  it('should call showAlert with correct alert', () => {
    const alert = { message: 'test' };
    service.showAlert(alert);
    expect(luigiMock.showAlert).toHaveBeenCalledWith(alert);
  });

  it('should call ux', () => {
    service.ux();
    expect(luigiMock.ux).toHaveBeenCalled();
  });

  it('should call theming', () => {
    service.theming();
    expect(luigiMock.theming).toHaveBeenCalled();
  });

  it('should call i18n', () => {
    service.i18n();
    expect(luigiMock.i18n).toHaveBeenCalled();
  });

  it('should set current locale', () => {
    service.setCurrentLocale('locale');

    expect(luigiMock.i18n().setCurrentLocale).toHaveBeenCalledWith('locale');
  });

  it('should call globalSearch', () => {
    service.globalSearch();
    expect(luigiMock.globalSearch).toHaveBeenCalled();
  });

  it('should call routing', () => {
    service.routing();
    expect(luigiMock.routing).toHaveBeenCalled();
  });

  it('should call sendCustomMessage', () => {
    const msg = { id: 'id-1' };
    service.sendCustomMessage(msg);
    expect(luigiMock.sendCustomMessage).toHaveBeenCalledWith(msg);
  });

  it('should call setFeatureToggle with correct featureToggleName', () => {
    const featureToggleName = 'someFeature';
    service.setFeatureToggle(featureToggleName);
    expect(luigiMock.featureToggles().setFeatureToggle).toHaveBeenCalledWith(
      featureToggleName,
    );
  });

  it('should return false if feature toggle is not active', () => {
    expect(service.isFeatureToggleActive('inactiveFeature')).toBe(false);
  });

  it('should return true if feature toggle is active', () => {
    luigiMock
      .featureToggles()
      .getActiveFeatureToggleList.mockReturnValue(['activeFeature']);
    expect(service.isFeatureToggleActive('activeFeature')).toBe(true);
  });

  describe('setFeatureToggles', () => {
    it('should call setFeatureToggle for each true feature toggle', () => {
      const featureToggles = {
        feature1: true,
        feature2: false,
        feature3: true,
      };
      service.setFeatureToggle = vi.fn();

      service.setFeatureToggles(featureToggles);

      expect(service.setFeatureToggle).toHaveBeenCalledTimes(2);
      expect(service.setFeatureToggle).toHaveBeenCalledWith('feature1');
      expect(service.setFeatureToggle).toHaveBeenCalledWith('feature3');
    });

    it('should not call setFeatureToggle for false feature toggles', () => {
      const featureToggles = {
        feature1: false,
        feature2: false,
      };
      service.setFeatureToggle = vi.fn();

      service.setFeatureToggles(featureToggles);

      expect(service.setFeatureToggle).not.toHaveBeenCalled();
    });

    it('should handle an empty object', () => {
      service.setFeatureToggle = vi.fn();

      service.setFeatureToggles({});

      expect(service.setFeatureToggle).not.toHaveBeenCalled();
    });

    it('should handle undefined input', () => {
      service.setFeatureToggle = vi.fn();

      service.setFeatureToggles(undefined);

      expect(service.setFeatureToggle).not.toHaveBeenCalled();
    });
  });

  describe('getWcExtendedContext', () => {
    it('should return the node context of luigi web component node', () => {
      const container = document.createElement('div');
      container.className = 'wcContainer';
      const webComponent = document.createElement('div');
      webComponent.setAttribute('lui_web_component', '');
      const expectedContext = { foo: 'bar' };
      (webComponent as any).extendedContext = { context: expectedContext };
      container.appendChild(webComponent);
      document.body.appendChild(container);

      const context = service.getWcExtendedContext();
      expect(context).toEqual(expectedContext);

      document.body.removeChild(container);
    });

    it('should return undefined if the wcContainer or lui_web_component element is missing', () => {
      document.body.innerHTML = '';
      const context = service.getWcExtendedContext();
      expect(context).toBeUndefined();
    });
  });

  describe('getWcModalExtendedContext', () => {
    it('should return the context for opened luigi modal node', () => {
      const container = document.createElement('div');
      container.className = 'iframeModalCtn';
      const webComponent = document.createElement('div');
      webComponent.setAttribute('lui_web_component', '');
      const expectedContext = { foo: 'bar' };
      (webComponent as any).extendedContext = { context: expectedContext };
      container.appendChild(webComponent);
      document.body.appendChild(container);

      const context = service.getWcModalExtendedContext();
      expect(context).toEqual(expectedContext);

      document.body.removeChild(container);
    });

    it('should return undefined if the iframeModalCtn or lui_web_component element is missing', () => {
      document.body.innerHTML = '';
      const context = service.getWcModalExtendedContext();
      expect(context).toBeUndefined();
    });
  });

  describe('Feature Toggle Management', () => {
    it('should call unsetFeatureToggle with correct featureToggleName', () => {
      const featureToggleName = 'someFeature';
      service.unsetFeatureToggle(featureToggleName);
      expect(
        luigiMock.featureToggles().unsetFeatureToggle,
      ).toHaveBeenCalledWith(featureToggleName);
    });

    it('should call unsetAllFeatureToggles for all active feature toggles', () => {
      luigiMock
        .featureToggles()
        .getActiveFeatureToggleList.mockReturnValue([
          'feature1',
          'feature2',
          'feature3',
        ]);
      service.unsetFeatureToggle = vi.fn();

      service.unsetAllFeatureToggles();

      expect(
        luigiMock.featureToggles().getActiveFeatureToggleList,
      ).toHaveBeenCalled();
      expect(service.unsetFeatureToggle).toHaveBeenCalledTimes(3);
      expect(service.unsetFeatureToggle).toHaveBeenCalledWith('feature1');
      expect(service.unsetFeatureToggle).toHaveBeenCalledWith('feature2');
      expect(service.unsetFeatureToggle).toHaveBeenCalledWith('feature3');
    });

    it('should return active feature toggle list', () => {
      const activeToggles = ['feature1', 'feature2'];
      luigiMock
        .featureToggles()
        .getActiveFeatureToggleList.mockReturnValue(activeToggles);

      const result = service.getActiveFeatureToggleList();

      expect(
        luigiMock.featureToggles().getActiveFeatureToggleList,
      ).toHaveBeenCalled();
      expect(result).toEqual(activeToggles);
    });
  });
});

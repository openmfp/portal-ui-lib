const luigiMock = {
  auth: jest.fn(),
  setConfig: jest.fn(),
  getConfig: jest.fn(),
  getConfigValue: jest.fn(),
  unload: jest.fn(),
  configChanged: jest.fn(),
  customMessages: jest.fn(),
  navigation: jest.fn(),
  reset: jest.fn(),
  clearNavigationCache: jest.fn(),
  showAlert: jest.fn(),
  ux: jest.fn(),
  theming: jest.fn(),
  i18n: jest.fn(),
  globalSearch: jest.fn(),
  routing: jest.fn(),
  sendCustomMessage: jest.fn(),
  featureToggles: jest.fn().mockReturnValue({
    setFeatureToggle: jest.fn(),
    getActiveFeatureToggleList: jest.fn().mockReturnValue([]),
  }),
};

(globalThis as any).Luigi = luigiMock;

import { TestBed } from '@angular/core/testing';
import { LuigiCoreService } from './luigi-core.service';

describe('LuigiCoreService', () => {
  let service: LuigiCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LuigiCoreService],
    });
    service = TestBed.inject(LuigiCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call auth', () => {
    service.auth();
    expect(luigiMock.auth).toHaveBeenCalled();
  });

  it('should call setConfig with correct config', () => {
    const config = { settings: 'value' };
    service.setConfig(config);
    expect(luigiMock.setConfig).toHaveBeenCalledWith(config);
  });

  it('should call getConfig', () => {
    service.getConfig();
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
      featureToggleName
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
      service.setFeatureToggle = jest.fn();

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
      service.setFeatureToggle = jest.fn();

      service.setFeatureToggles(featureToggles);

      expect(service.setFeatureToggle).not.toHaveBeenCalled();
    });

    it('should handle an empty object', () => {
      service.setFeatureToggle = jest.fn();

      service.setFeatureToggles({});

      expect(service.setFeatureToggle).not.toHaveBeenCalled();
    });

    it('should handle undefined input', () => {
      service.setFeatureToggle = jest.fn();

      service.setFeatureToggles(undefined);

      expect(service.setFeatureToggle).not.toHaveBeenCalled();
    });
  });
});

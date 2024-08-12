import { fakeAsync, tick } from '@angular/core/testing';
import { LuigiComponent } from './luigi.component';
import { LuigiCoreService, AuthService, LuigiConfigService } from '../services';

describe('LuigiComponent', () => {
  let component: LuigiComponent;
  let luigiConfigServiceMock: jest.Mocked<LuigiConfigService>;
  let luigiCoreServiceMock: jest.Mocked<LuigiCoreService>;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Create mock services
    luigiConfigServiceMock = {
      getLuigiConfiguration: jest.fn(),
    } as any;

    luigiCoreServiceMock = {
      setConfig: jest.fn(),
      auth: jest.fn(),
    } as any;

    authServiceMock = {
      getAuthData: jest.fn(),
    } as any;

    // Set up successful promise resolution for getLuigiConfiguration
    luigiConfigServiceMock.getLuigiConfiguration.mockResolvedValue({
      some: 'config',
    } as any);

    // Set up auth mock
    luigiCoreServiceMock.auth.mockReturnValue({
      store: { setAuthData: jest.fn() },
    });

    // Create component instance
    component = new LuigiComponent(
      luigiConfigServiceMock,
      luigiCoreServiceMock,
      authServiceMock
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getLuigiConfiguration on initialization', fakeAsync(() => {
    tick();

    expect(luigiConfigServiceMock.getLuigiConfiguration).toHaveBeenCalled();
  }));

  it('should set Luigi config when getLuigiConfiguration resolves', fakeAsync(() => {
    tick();

    expect(luigiCoreServiceMock.setConfig).toHaveBeenCalledWith({
      some: 'config',
    });
  }));

  it('should set auth data when getLuigiConfiguration resolves', fakeAsync(() => {
    const mockAuthData = { idToken: 'someToken', accessTokenExpirationDate: 5 };
    authServiceMock.getAuthData.mockReturnValue(mockAuthData);

    component = new LuigiComponent(
      luigiConfigServiceMock,
      luigiCoreServiceMock,
      authServiceMock
    );
    tick();

    expect(authServiceMock.getAuthData).toHaveBeenCalled();
    expect(luigiCoreServiceMock.auth().store.setAuthData).toHaveBeenCalledWith(
      mockAuthData
    );
  }));

  it('should log error when getLuigiConfiguration rejects', fakeAsync(() => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Configuration error');
    luigiConfigServiceMock.getLuigiConfiguration.mockRejectedValue(mockError);

    // Re-create component to trigger the error
    component = new LuigiComponent(
      luigiConfigServiceMock,
      luigiCoreServiceMock,
      authServiceMock
    );

    tick();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Luigi Component init failed: ${mockError.toString()}`
    );

    consoleErrorSpy.mockRestore();
  }));
});

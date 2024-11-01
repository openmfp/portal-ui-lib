import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { NavigationGlobalContextConfigService } from '../luigi-config/navigation-global-context-config.service';
import { AuthService } from '../portal';
import { LuigiCoreService } from '../luigi-core.service';
import { SessionRefreshService } from './session-refresh.service';
import { AuthData, AuthEvent } from '../../models';

describe('SessionRefreshService', () => {
  let service: SessionRefreshService;
  let authService: jest.Mocked<AuthService>;
  let luigiCoreService: jest.Mocked<LuigiCoreService>;
  let navigationGlobalContextConfigServiceMock: jest.Mocked<NavigationGlobalContextConfigService> =
    mock();

  // Mock data
  const mockAuthData = {
    accessTokenExpirationDate: 90,
    idToken: 'mock-id-token',
  } as AuthData;

  beforeEach(() => {
    // Create mock services
    (window as any).IDP = { setTokenExpireSoonAction: jest.fn() };

    const authServiceMock = {
      refresh: jest.fn().mockResolvedValue(undefined),
      authEvent: jest.fn(),
      getAuthData: jest.fn().mockReturnValue(mockAuthData),
    };

    const luigiCoreServiceMock = mock<LuigiCoreService>();

    TestBed.configureTestingModule({
      providers: [
        SessionRefreshService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        {
          provide:
            LUIGI_NAVIGATION_GLOBAL_CONTEXT_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: navigationGlobalContextConfigServiceMock,
        },
      ],
    });

    // Get instances
    service = TestBed.inject(SessionRefreshService);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    luigiCoreService = TestBed.inject(
      LuigiCoreService
    ) as jest.Mocked<LuigiCoreService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refresh', () => {
    it('should successfully refresh the session', async () => {
      //Arrange
      const globalCtx = {};
      navigationGlobalContextConfigServiceMock.getGlobalContext.mockReturnValue(
        globalCtx
      );

      // Act
      await service.refresh();

      // Assert
      expect(authService.refresh).toHaveBeenCalledTimes(1);
      expect(authService.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_REFRESHED
      );
      expect(authService.getAuthData).toHaveBeenCalledTimes(1);
      expect(luigiCoreService.setAuthData).toHaveBeenCalledWith(mockAuthData);
      expect(
        navigationGlobalContextConfigServiceMock.getGlobalContext
      ).toHaveBeenCalledTimes(1);
      expect(luigiCoreService.setGlobalContext).toHaveBeenCalledTimes(1);
      expect(luigiCoreService.setGlobalContext).toHaveBeenCalledWith(
        globalCtx,
        true
      );
      expect(
        (window as any).IDP.setTokenExpireSoonAction
      ).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from authService.refresh', async () => {
      // Arrange
      const error = new Error('Refresh failed');
      authService.refresh.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(service.refresh()).rejects.toThrow('Refresh failed');
      expect(authService.authEvent).not.toHaveBeenCalled();
      expect(luigiCoreService.setAuthData).not.toHaveBeenCalled();
      expect(luigiCoreService.setGlobalContext).not.toHaveBeenCalled();
    });

    it('should execute operations in the correct order', async () => {
      // Arrange
      const executionOrder: string[] = [];

      authService.refresh.mockImplementation(async () => {
        executionOrder.push('refresh');
      });

      authService.authEvent.mockImplementation(() => {
        executionOrder.push('authEvent');
      });

      authService.getAuthData.mockImplementation(() => {
        executionOrder.push('getAuthData');
        return mockAuthData;
      });

      luigiCoreService.setAuthData.mockImplementation(() => {
        executionOrder.push('setAuthData');
      });

      navigationGlobalContextConfigServiceMock.getGlobalContext.mockImplementation(
        () => {
          executionOrder.push('getGlobalContext');
          return null;
        }
      );

      luigiCoreService.setGlobalContext.mockImplementation(() => {
        executionOrder.push('setGlobalContext');
      });

      (window as any).IDP.setTokenExpireSoonAction.mockImplementation(() => {
        executionOrder.push('setTokenExpireSoonAction');
      });

      // Act
      await service.refresh();

      // Assert
      expect(executionOrder).toEqual([
        'refresh',
        'authEvent',
        'getAuthData',
        'setAuthData',
        'getGlobalContext',
        'setGlobalContext',
        'setTokenExpireSoonAction',
      ]);
    });
  });
});

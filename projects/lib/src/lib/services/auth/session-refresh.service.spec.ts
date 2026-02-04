import {
  AuthData,
  AuthEvent,
  AuthTokenData,
  LuigiGlobalContext,
} from '../../models';
import { GlobalContextConfigService } from '../luigi-config/global-context-config.service';
import { LuigiCoreService } from '../luigi-core.service';
import { AuthService } from '../portal';
import { SessionRefreshService } from './session-refresh.service';
import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('SessionRefreshService', () => {
  let service: SessionRefreshService;
  let authService: MockedObject<AuthService>;
  let luigiCoreService: MockedObject<LuigiCoreService>;
  let globalContextConfigServiceMock: MockedObject<GlobalContextConfigService>;

  // Mock data
  const mockAuthData = {
    accessTokenExpirationDate: 90,
    idToken: 'mock-id-token',
  } as AuthData;

  beforeEach(() => {
    globalContextConfigServiceMock = mock();

    // Create mock services
    (window as any).IDP = { setTokenExpireSoonAction: vi.fn() };

    const authServiceMock = {
      refresh: vi.fn().mockResolvedValue(undefined),
      authEvent: vi.fn(),
      getAuthData: vi.fn().mockReturnValue(mockAuthData),
    };

    const luigiCoreServiceMock = mock<LuigiCoreService>();

    TestBed.configureTestingModule({
      providers: [
        SessionRefreshService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: LuigiCoreService, useValue: luigiCoreServiceMock },
        {
          provide: GlobalContextConfigService,
          useValue: globalContextConfigServiceMock,
        },
      ],
    });

    // Get instances
    service = TestBed.inject(SessionRefreshService);
    authService = TestBed.inject(AuthService) as MockedObject<AuthService>;
    luigiCoreService = TestBed.inject(
      LuigiCoreService,
    ) as MockedObject<LuigiCoreService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refresh', () => {
    it('should successfully refresh the session', async () => {
      //Arrange
      const globalCtx = {} as LuigiGlobalContext;
      globalContextConfigServiceMock.getGlobalContext.mockResolvedValue(
        globalCtx,
      );
      authService.refresh.mockResolvedValue({} as AuthTokenData);

      // Act
      await service.refresh();

      // Assert
      expect(authService.refresh).toHaveBeenCalledTimes(1);
      expect(authService.authEvent).toHaveBeenCalledWith(
        AuthEvent.AUTH_REFRESHED,
      );
      expect(authService.getAuthData).toHaveBeenCalledTimes(1);
      expect(luigiCoreService.setAuthData).toHaveBeenCalledWith(mockAuthData);
      expect(
        globalContextConfigServiceMock.getGlobalContext,
      ).toHaveBeenCalledTimes(1);
      expect(luigiCoreService.setGlobalContext).toHaveBeenCalledTimes(1);
      expect(luigiCoreService.setGlobalContext).toHaveBeenCalledWith(
        globalCtx,
        true,
      );
    });

    it('should not successfully refresh the session', async () => {
      //Arrange
      const globalCtx = {} as LuigiGlobalContext;
      globalContextConfigServiceMock.getGlobalContext.mockResolvedValue(
        globalCtx,
      );
      authService.refresh.mockResolvedValue(undefined);

      // Act
      await service.refresh();

      // Assert
      expect(authService.refresh).toHaveBeenCalled();
      expect(authService.authEvent).not.toHaveBeenCalledWith(
        AuthEvent.AUTH_REFRESHED,
      );
      expect(authService.getAuthData).not.toHaveBeenCalled();
      expect(luigiCoreService.setAuthData).not.toHaveBeenCalledWith(
        mockAuthData,
      );
      expect(
        globalContextConfigServiceMock.getGlobalContext,
      ).not.toHaveBeenCalled();
      expect(luigiCoreService.setGlobalContext).not.toHaveBeenCalled();
      expect(
        (window as any).IDP.setTokenExpireSoonAction,
      ).not.toHaveBeenCalled();
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
        return {} as AuthTokenData;
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

      globalContextConfigServiceMock.getGlobalContext.mockImplementation(() => {
        executionOrder.push('getGlobalContext');
        return null as any;
      });

      luigiCoreService.setGlobalContext.mockImplementation(() => {
        executionOrder.push('setGlobalContext');
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
      ]);
    });
  });
});

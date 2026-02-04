import {
  AuthService,
  LuigiCoreService,
  StaticSettingsConfigServiceImpl,
} from '../../services';
import { AuthConfigService } from '../../services/luigi-config/auth-config.service';
import { LifecycleHooksConfigService } from '../../services/luigi-config/lifecycle-hooks-config.service';
import { RoutingConfigServiceImpl } from '../../services/luigi-config/routing-config.service';
import { LuigiComponent } from './luigi.component';
import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('LuigiComponent', () => {
  let component: LuigiComponent;
  let authService: MockedObject<AuthService>;
  let luigiCoreService: MockedObject<LuigiCoreService>;
  let authConfigService: MockedObject<AuthConfigService>;
  let routingConfigService: MockedObject<RoutingConfigServiceImpl>;
  let lifecycleHooksConfigService: MockedObject<LifecycleHooksConfigService>;
  let staticSettingsConfigService: MockedObject<StaticSettingsConfigServiceImpl>;

  beforeEach(() => {
    staticSettingsConfigService = mock();
    authService = {
      getAuthData: vi.fn().mockReturnValue({ user: 'u' }),
    } as any;
    luigiCoreService = { setAuthData: vi.fn(), setConfig: vi.fn() } as any;
    authConfigService = {
      getAuthConfig: vi.fn().mockResolvedValue({ auth: 'config' }),
    } as any;
    routingConfigService = {
      getInitialRoutingConfig: vi.fn().mockReturnValue({ route: 'r' }),
    } as any;
    lifecycleHooksConfigService = {
      getLifecycleHooksConfig: vi.fn().mockReturnValue({ hook: 'h' }),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: LuigiCoreService, useValue: luigiCoreService },
        { provide: AuthConfigService, useValue: authConfigService },
        { provide: RoutingConfigServiceImpl, useValue: routingConfigService },
        {
          provide: StaticSettingsConfigServiceImpl,
          useValue: staticSettingsConfigService,
        },
        {
          provide: LifecycleHooksConfigService,
          useValue: lifecycleHooksConfigService,
        },
      ],
    });

    component = TestBed.createComponent(LuigiComponent).componentInstance;
  });

  it('should set auth data and config on init', async () => {
    await component.ngOnInit();
    expect(luigiCoreService.setAuthData).toHaveBeenCalledWith({ user: 'u' });
    expect(authConfigService.getAuthConfig).toHaveBeenCalled();
    expect(routingConfigService.getInitialRoutingConfig).toHaveBeenCalled();
    expect(
      lifecycleHooksConfigService.getLifecycleHooksConfig,
    ).toHaveBeenCalled();
    expect(luigiCoreService.setConfig).toHaveBeenCalledWith({
      auth: { auth: 'config' },
      routing: { route: 'r' },
      lifecycleHooks: { hook: 'h' },
    });
  });

  it('should log error if init fails', async () => {
    const error = new Error('fail');
    authConfigService.getAuthConfig.mockRejectedValue(error);
    const spy = vi
      .spyOn(console, 'error')
      .mockImplementation((message: string) => {});
    await component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(
      `Luigi Component init failed: ${error.toString()}`,
    );
    spy.mockRestore();
  });
});

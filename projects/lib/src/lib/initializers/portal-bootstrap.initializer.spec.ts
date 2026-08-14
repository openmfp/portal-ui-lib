import { AuthService, EnvConfigService } from '../services';
import { bootstrap, provideBootstrap } from './portal-bootstrap.initializer';
import { TestBed } from '@angular/core/testing';
import { MockedObject } from 'vitest';

describe('bootstrap', () => {
  let authService: MockedObject<AuthService>;
  let envConfigService: MockedObject<EnvConfigService>;

  beforeEach(() => {
    authService = {
      refresh: vi.fn(),
    } as any;

    envConfigService = {
      getEnvConfig: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: EnvConfigService, useValue: envConfigService },
      ],
    });
  });

  it('should call refresh when config is valid', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: 'https://oauth.example.com',
      clientId: 'client-123',
    } as any);
    authService.refresh.mockResolvedValue(undefined);

    await bootstrap(authService, envConfigService);

    expect(envConfigService.getEnvConfig).toHaveBeenCalled();
    expect(authService.refresh).toHaveBeenCalled();
  });

  it('should not call refresh when oauthServerUrl is missing', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: '',
      clientId: 'client-123',
    } as any);

    await bootstrap(authService, envConfigService);

    expect(envConfigService.getEnvConfig).toHaveBeenCalled();
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should not call refresh when clientId is missing', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: 'https://oauth.example.com',
      clientId: '',
    } as any);

    await bootstrap(authService, envConfigService);

    expect(envConfigService.getEnvConfig).toHaveBeenCalled();
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should not call refresh when both config values are missing', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: '',
      clientId: '',
    } as any);

    await bootstrap(authService, envConfigService);

    expect(envConfigService.getEnvConfig).toHaveBeenCalled();
    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should not call refresh when oauthServerUrl is null', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: null,
      clientId: 'client-123',
    } as any);

    await bootstrap(authService, envConfigService);

    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should not call refresh when clientId is null', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: 'https://oauth.example.com',
      clientId: null,
    } as any);

    await bootstrap(authService, envConfigService);

    expect(authService.refresh).not.toHaveBeenCalled();
  });

  it('should handle getEnvConfig error gracefully', async () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((message: string) => {});
    const error = new Error('Config error');
    envConfigService.getEnvConfig.mockRejectedValue(error);

    await bootstrap(authService, envConfigService);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error bootstrapping the app:',
      error,
    );
    expect(authService.refresh).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle refresh error gracefully', async () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((message: string) => {});
    const error = new Error('Refresh error');
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: 'https://oauth.example.com',
      clientId: 'client-123',
    } as any);
    authService.refresh.mockRejectedValue(error);

    await bootstrap(authService, envConfigService);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error bootstrapping the app:',
      error,
    );

    consoleSpy.mockRestore();
  });

  it('should handle undefined config values', async () => {
    envConfigService.getEnvConfig.mockResolvedValue({
      oauthServerUrl: undefined,
      clientId: undefined,
    } as any);

    await bootstrap(authService, envConfigService);

    expect(authService.refresh).not.toHaveBeenCalled();
  });
});

describe('provideBootstrap', () => {
  let authService: MockedObject<AuthService>;
  let envConfigService: MockedObject<EnvConfigService>;

  beforeEach(() => {
    authService = {
      refresh: vi.fn(),
    } as any;

    envConfigService = {
      getEnvConfig: vi.fn().mockResolvedValue({
        oauthServerUrl: 'https://oauth.example.com',
        clientId: 'client-123',
      }),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: EnvConfigService, useValue: envConfigService },
        provideBootstrap(),
      ],
    });
  });

  it('returns environment providers', () => {
    const providers = provideBootstrap();
    expect(providers).toBeDefined();
  });
});

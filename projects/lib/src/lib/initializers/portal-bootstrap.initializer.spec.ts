import { AuthService } from '../services';
import { bootstrap, provideBootstrap } from './portal-bootstrap.initializer';

describe('bootstrap', () => {
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = { refresh: jest.fn() } as any;
  });

  it('calls refresh on authService', async () => {
    authService.refresh.mockResolvedValue(undefined);
    await bootstrap(authService);
    expect(authService.refresh).toHaveBeenCalled();
  });

  it('logs error when refresh fails', async () => {
    const error = new Error('fail');
    authService.refresh.mockRejectedValue(error);
    const spy = jest.spyOn(console, 'error').mockImplementation();
    await bootstrap(authService);
    expect(spy).toHaveBeenCalledWith('Error bootstrapping the app:', error);
    spy.mockRestore();
  });
});

describe('provideBootstrap', () => {
  it('returns environment providers', () => {
    const providers = provideBootstrap();
    expect(providers).toBeDefined();
  });
});

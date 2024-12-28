import { APP_INITIALIZER } from '@angular/core';
import { AuthService } from '../services';
import { provideBootstrap } from './app-bootstrap.initializer';
import Mocked = jest.Mocked;

describe('provideBootstrap', () => {
  const authServiceMock = {
    refresh: jest.fn(),
  } as any as Mocked<AuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create bootstrap provider with correct configuration', () => {
    const provider = provideBootstrap();

    expect(provider).toEqual({
      provide: APP_INITIALIZER,
      useFactory: expect.any(Function),
      multi: true,
      deps: [AuthService],
    });
  });

  describe('bootstrap factory', () => {
    const bootstrapFactory = provideBootstrap().useFactory;
    const initFn = bootstrapFactory(authServiceMock);

    it('should call refresh on init', async () => {
      authServiceMock.refresh.mockResolvedValue(undefined);

      await initFn();

      expect(authServiceMock.refresh).toHaveBeenCalled();
    });

    it('should handle refresh error', async () => {
      const consoleError = jest.spyOn(console, 'error');
      const error = new Error('Failed to refresh');
      authServiceMock.refresh.mockRejectedValue(error);

      await initFn();

      expect(consoleError).toHaveBeenCalledWith(
        'Error bootstrapping the app:',
        error
      );
      consoleError.mockRestore();
    });
  });
});

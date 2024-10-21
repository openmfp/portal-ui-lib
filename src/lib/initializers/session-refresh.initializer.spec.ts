import { TestBed } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { SessionRefreshService } from '../services/auth/session-refresh.service';
import { provideSessionRefresh } from './session-refresh.initializer';

describe('provideSessionRefresh', () => {
  let mockSessionRefreshService: jest.Mocked<SessionRefreshService>;

  beforeEach(() => {
    mockSessionRefreshService = {
      refresh: jest.fn().mockResolvedValue(undefined),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: SessionRefreshService, useValue: mockSessionRefreshService },
        provideSessionRefresh(),
      ],
    });
  });

  it('should provide APP_INITIALIZER', () => {
    const appInitializer = TestBed.inject(APP_INITIALIZER);
    expect(appInitializer).toBeDefined();
  });

  it('should call SessionRefreshService.refresh() when APP_INITIALIZER is executed', async () => {
    const appInitializer = TestBed.inject(APP_INITIALIZER) as any[];

    expect(mockSessionRefreshService.refresh).toHaveBeenCalledTimes(1);
  });

  it('should provide APP_INITIALIZER as multi', () => {
    const provider = provideSessionRefresh();
    expect(provider.multi).toBe(true);
  });

  it('should depend on SessionRefreshService', () => {
    const provider = provideSessionRefresh();
    expect(provider.deps).toContain(SessionRefreshService);
  });
});

import { TestBed } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { provideNavigationTracker } from './navigation-tracker.initializer';

describe('Navigation Tracker Provider', () => {
  let navigationService: jest.Mocked<NavigationService>;

  beforeEach(() => {
    navigationService = {
      track: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: NavigationService, useValue: navigationService },
        provideNavigationTracker(),
      ],
    });
  });

  it('should provide APP_INITIALIZER', () => {
    const initializer = TestBed.inject(APP_INITIALIZER);
    expect(initializer).toBeTruthy();
  });

  it('should call track method during initialization', async () => {
    const provider = provideNavigationTracker();
    const factory = provider.useFactory;

    await factory(navigationService)();

    expect(navigationService.track).toHaveBeenCalled();
  });

  it('should be multi provider', () => {
    const provider = provideNavigationTracker();
    expect(provider.multi).toBe(true);
  });

  it('should depend on NavigationService', () => {
    const provider = provideNavigationTracker();
    expect(provider.deps).toEqual([NavigationService]);
  });
});

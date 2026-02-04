import { NavigationService } from '../services/navigation.service';
import {
  provideNavigationTracker,
  track,
} from './navigation-tracker.initializer';
import { MockedObject } from 'vitest';

describe('track', () => {
  let navigationService: MockedObject<NavigationService>;

  beforeEach(() => {
    navigationService = { track: vi.fn() } as any;
  });

  it('calls track on navigationService', async () => {
    await track(navigationService);
    expect(navigationService.track).toHaveBeenCalled();
  });
});

describe('provideNavigationTracker', () => {
  it('returns environment providers', () => {
    const providers = provideNavigationTracker();
    expect(providers).toBeDefined();
  });
});

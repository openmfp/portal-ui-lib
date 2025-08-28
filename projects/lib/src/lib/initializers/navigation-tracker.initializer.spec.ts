import { NavigationService } from '../services/navigation.service';
import {
  provideNavigationTracker,
  track,
} from './navigation-tracker.initializer';

describe('track', () => {
  let navigationService: jest.Mocked<NavigationService>;

  beforeEach(() => {
    navigationService = { track: jest.fn() } as any;
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

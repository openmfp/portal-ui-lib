import { AnalyticsTracker } from '../models';
import { provideAnalyticsTracking } from './analytics-tracker.initializer';

describe('provideAnalyticsTracking', () => {
  it('returns environment providers', () => {
    const providers = provideAnalyticsTracking();
    expect(providers).toBeDefined();
  });
});

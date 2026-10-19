import { ANALYTICS_TRACKER_INJECTION_TOKEN } from '../injection-tokens';
import { AnalyticsTracker } from '../models';
import { inject, provideAppInitializer } from '@angular/core';

export const provideAnalyticsTracking = () =>
  provideAppInitializer(() => {
    const trackers =
      inject<AnalyticsTracker[]>(ANALYTICS_TRACKER_INJECTION_TOKEN as any, {
        optional: true,
      }) ?? [];
    trackers.forEach((tracker) => tracker.initialize().catch());
  });

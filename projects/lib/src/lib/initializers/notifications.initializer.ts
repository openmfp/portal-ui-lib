import { NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN } from '../injection-tokens';
import { NotificationsInitializer } from '../models';
import { inject, provideAppInitializer } from '@angular/core';

export const provideNotifications = () =>
  provideAppInitializer(() => {
    const initializers =
      inject<NotificationsInitializer[]>(
        NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN as any,
        { optional: true },
      ) ?? [];

    for (const initializer of initializers) {
      void initializer.initialize().catch((error) => {
        console.error('Failed to initialize notifications', error);
      });
    }
  });

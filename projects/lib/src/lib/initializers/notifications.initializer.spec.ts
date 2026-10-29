import { NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN } from '../injection-tokens';
import { NotificationsInitializer } from '../models';
import { provideNotifications } from './notifications.initializer';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mock } from 'vitest-mock-extended';

describe('provideNotifications', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should complete startup when no notifications initializers are provided', async () => {
    TestBed.configureTestingModule({
      providers: [provideNotifications()],
    });

    const status = TestBed.inject(ApplicationInitStatus);

    await expect(status.donePromise).resolves.toBeUndefined();
    expect(status.done).toBe(true);
  });

  it('should initialize every registered implementation once', async () => {
    const firstInitializer = mock<NotificationsInitializer>();
    const secondInitializer = mock<NotificationsInitializer>();
    firstInitializer.initialize.mockResolvedValue(undefined);
    secondInitializer.initialize.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideNotifications(),
        {
          provide: NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN,
          multi: true,
          useValue: firstInitializer,
        },
        {
          provide: NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN,
          multi: true,
          useValue: secondInitializer,
        },
      ],
    });

    await TestBed.inject(ApplicationInitStatus).donePromise;
    TestBed.inject(ApplicationInitStatus);

    expect(firstInitializer.initialize).toHaveBeenCalledTimes(1);
    expect(secondInitializer.initialize).toHaveBeenCalledTimes(1);
  });

  it('should complete startup when the registered list is empty', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideNotifications(),
        {
          provide: NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN,
          useValue: [],
        },
      ],
    });

    const status = TestBed.inject(ApplicationInitStatus);

    await expect(status.donePromise).resolves.toBeUndefined();
    expect(status.done).toBe(true);
  });

  it('should not block startup while a notifications initializer is pending', async () => {
    let finishInitialization!: () => void;
    const initialization = new Promise<void>((resolve) => {
      finishInitialization = resolve;
    });
    const initializer = mock<NotificationsInitializer>();
    initializer.initialize.mockReturnValue(initialization);

    TestBed.configureTestingModule({
      providers: [
        provideNotifications(),
        {
          provide: NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN,
          multi: true,
          useValue: initializer,
        },
      ],
    });

    const status = TestBed.inject(ApplicationInitStatus);

    expect(status.done).toBe(true);
    await expect(status.donePromise).resolves.toBeUndefined();
    expect(initializer.initialize).toHaveBeenCalledTimes(1);

    finishInitialization();
    await initialization;
  });

  it('should log rejected initialization without failing startup or skipping other implementations', async () => {
    const error = new Error('Notifications unavailable');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    const failingInitializer = mock<NotificationsInitializer>();
    const otherInitializer = mock<NotificationsInitializer>();
    failingInitializer.initialize.mockRejectedValue(error);
    otherInitializer.initialize.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideNotifications(),
        {
          provide: NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN,
          multi: true,
          useValue: failingInitializer,
        },
        {
          provide: NOTIFICATIONS_INITIALIZER_INJECTION_TOKEN,
          multi: true,
          useValue: otherInitializer,
        },
      ],
    });

    const status = TestBed.inject(ApplicationInitStatus);

    await expect(status.donePromise).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      'Failed to initialize notifications',
      error,
    );
    expect(failingInitializer.initialize).toHaveBeenCalledTimes(1);
    expect(otherInitializer.initialize).toHaveBeenCalledTimes(1);
  });
});

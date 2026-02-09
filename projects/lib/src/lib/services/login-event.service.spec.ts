import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from '@angular/core/testing';
import {
  LoginEventService,
  LoginEventType,
  LoginEvent,
} from './login-event.service';
import { firstValueFrom, Observable } from 'rxjs';

describe('LoginEventService', () => {
  let service: LoginEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginEventService],
    });
    service = TestBed.inject(LoginEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit login event', async () => {
    const testEvent: LoginEvent = {
      type: LoginEventType.LOGIN_TRIGGERED,
      queryParams: { redirect: '/dashboard' },
    };

    const eventPromise = firstValueFrom(service.loginEvents);
    service.loginEvent(testEvent);

    const emittedEvent = await eventPromise;
    expect(emittedEvent).toEqual(testEvent);
  });

  it('should emit logout event', async () => {
    const testEvent: LoginEvent = {
      type: LoginEventType.LOGOUT_TRIGGERED,
      queryParams: { reason: 'session_expired' },
    };

    const eventPromise = firstValueFrom(service.loginEvents);
    service.loginEvent(testEvent);

    const emittedEvent = await eventPromise;
    expect(emittedEvent).toEqual(testEvent);
  });

  it('should emit event without query params', async () => {
    const testEvent: LoginEvent = {
      type: LoginEventType.LOGIN_TRIGGERED,
    };

    const eventPromise = firstValueFrom(service.loginEvents);
    service.loginEvent(testEvent);

    const emittedEvent = await eventPromise;
    expect(emittedEvent).toEqual(testEvent);
  });

  it('should return an Observable from loginEvents getter', () => {
    const events$ = service.loginEvents;
    expect(events$).toBeTruthy();
    expect(events$ instanceof Observable).toBeTruthy();
  });
});

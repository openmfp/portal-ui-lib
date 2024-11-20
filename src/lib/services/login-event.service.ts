import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum LoginEventType {
  LOGIN_TRIGGERED = 'LoginTriggered',
  LOGOUT_TRIGGERED = 'LogoutTriggered',
}

export interface LoginEvent {
  type: LoginEventType;
  queryParams?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class LoginEventService {
  private events: Subject<LoginEvent> = new Subject<LoginEvent>();

  get loginEvents(): Observable<LoginEvent> {
    return this.events.asObservable();
  }

  loginEvent(event: LoginEvent) {
    this.events.next(event);
  }
}

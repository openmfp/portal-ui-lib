import { Injectable } from '@angular/core';

export interface LuigiAuthEventsCallbacksService {
  onAuthSuccessful: (settings: any, authData: any) => void;
  onAuthError: (settings: any, err: any) => void;
  onAuthExpired: (settings: any) => void;
  onLogout: (settings: any) => void;
  onAuthExpireSoon: (settings: any) => void;
  onAuthConfigError: (settings: any, err: any) => void;
}

@Injectable({ providedIn: 'root' })
export class NoopLuigiAuthEventsCallbacksService
  implements LuigiAuthEventsCallbacksService
{
  onAuthSuccessful(settings: any, authData: any) {}
  onAuthError(settings: any, err: any) {}
  onAuthExpired(settings: any) {}
  onLogout(settings: any) {}
  onAuthExpireSoon(settings: any) {}
  onAuthConfigError(settings: any, err: any) {}
}

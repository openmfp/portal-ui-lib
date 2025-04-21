export class LuigiAuthEventsCallbacksService {
  onAuthSuccessful: (settings: any, authData: any) => {};
  onAuthError: (settings: any, err: any) => {};
  onAuthExpired: (settings: any) => {};
  onLogout: (settings: any) => {};
  onAuthExpireSoon: (settings: any) => {};
  onAuthConfigError: (settings: any, err: any) => {};
}

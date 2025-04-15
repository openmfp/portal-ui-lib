export interface LuigiAuthEventsCallbacksService {
  onAuthSuccessful: (settings: any, authData: any) => void;
  onAuthError: (settings: any, err: any) => void;
  onAuthExpired: (settings: any) => void;
  onLogout: (settings: any) => void;
  onAuthExpireSoon: (settings: any) => void;
  onAuthConfigError: (settings: any, err: any) => void;
}

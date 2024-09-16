import { NoopLuigiAuthEventsCallbacksService } from './luigi-auth-events-callbacks.service';

describe('NoopLuigiAuthEventsCallbacksService', () => {
  let service: NoopLuigiAuthEventsCallbacksService;

  beforeEach(() => {
    service = new NoopLuigiAuthEventsCallbacksService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should implement onAuthSuccessful method', () => {
    expect(() => service.onAuthSuccessful({}, {})).not.toThrow();
  });

  it('should implement onAuthError method', () => {
    expect(() =>
      service.onAuthError({}, new Error('Test error'))
    ).not.toThrow();
  });

  it('should implement onAuthExpired method', () => {
    expect(() => service.onAuthExpired({})).not.toThrow();
  });

  it('should implement onLogout method', () => {
    expect(() => service.onLogout({})).not.toThrow();
  });

  it('should implement onAuthExpireSoon method', () => {
    expect(() => service.onAuthExpireSoon({})).not.toThrow();
  });

  it('should implement onAuthConfigError method', () => {
    expect(() =>
      service.onAuthConfigError({}, new Error('Test error'))
    ).not.toThrow();
  });
});

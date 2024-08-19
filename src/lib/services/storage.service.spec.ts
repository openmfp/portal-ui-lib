import { NoopLocalStorageService } from './storage.service';

describe('StorageService', () => {
  let service: NoopLocalStorageService;

  beforeEach(() => {
    service = new NoopLocalStorageService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearLocalStorage', () => {
    it('should have a clearLocalStorage method', () => {
      expect(service.clearLocalStorage).toBeDefined();
      expect(typeof service.clearLocalStorage).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => service.clearLocalStorage()).not.toThrow();
    });
  });

  describe('clearLocalConfigStorage', () => {
    it('should have a clearLocalConfigStorage method', () => {
      expect(service.clearLocalConfigStorage).toBeDefined();
      expect(typeof service.clearLocalConfigStorage).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => service.clearLocalConfigStorage()).not.toThrow();
    });
  });
});

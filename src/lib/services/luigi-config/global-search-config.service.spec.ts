import { NoopGlobalSearchConfigService } from './global-search-config.service';

describe('NoopGlobalSearchConfigService', () => {
  let service: NoopGlobalSearchConfigService;

  beforeEach(() => {
    service = new NoopGlobalSearchConfigService();
  });

  describe('getGlobalSearchConfig', () => {
    it('should return undefined', () => {
      const result = service.getGlobalSearchConfig();
      expect(result).toBeUndefined();
    });

    it('should return undefined', () => {
      expect(service.getGlobalSearchConfig()).toBeUndefined();
    });
  });
});

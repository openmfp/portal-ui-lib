import {
  CommunicationConfigService,
  CommunicationConfigServiceImpl,
} from './communication-config.service';

describe('CommunicationConfigServiceImpl', () => {
  let service: CommunicationConfigService;

  beforeEach(() => {
    service = new CommunicationConfigServiceImpl();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCommunicationConfig', () => {
    it('should return undefined', () => {
      const result = service.getCommunicationConfig();
      expect(result).toBeUndefined();
    });
  });
});

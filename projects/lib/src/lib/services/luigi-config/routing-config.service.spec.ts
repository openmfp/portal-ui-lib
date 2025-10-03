import { RoutingConfigServiceImpl } from './routing-config.service';

describe('RoutingConfigService', () => {
  let service: RoutingConfigServiceImpl;

  beforeEach(() => {
    service = new RoutingConfigServiceImpl();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInitialRoutingConfig', () => {
    it('should return the correct initial configuration', () => {
      const config = service.getInitialRoutingConfig();

      expect(config).toEqual({
        useHashRouting: false,
        showModalPathInUrl: false,
        modalPathParam: 'modalPathParamDisabled',
        skipRoutingForUrlPatterns: expect.arrayContaining([expect.any(RegExp)]),
        pageNotFoundHandler: expect.any(Function),
      });
    });

    it('should have a skipRoutingForUrlPatterns that matches any string', () => {
      const config = service.getInitialRoutingConfig();
      expect(
        config.skipRoutingForUrlPatterns[0].test('any string'),
      ).toBeTruthy();
    });
  });

  describe('getRoutingConfig', () => {
    it('should return the correct routing configuration', () => {
      const config = service.getRoutingConfig();

      expect(config).toEqual({
        useHashRouting: false,
        showModalPathInUrl: true,
        modalPathParam: 'modal',
        pageNotFoundHandler: expect.any(Function),
      });
    });

    it('pageNotFoundHandler should return the correct object', () => {
      const config = service.getRoutingConfig();
      const result = config.pageNotFoundHandler('some/path', true);

      expect(result).toEqual({
        redirectTo: 'error/404',
        keepURL: true,
      });
    });
  });
});

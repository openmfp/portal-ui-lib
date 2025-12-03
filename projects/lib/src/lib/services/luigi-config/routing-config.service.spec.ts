import { LUIGI_ROUTING_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { RoutingConfigServiceImpl } from './routing-config.service';
import { TestBed } from '@angular/core/testing';

describe('RoutingConfigService', () => {
  let service: RoutingConfigServiceImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoutingConfigServiceImpl,
        {
          provide: LUIGI_ROUTING_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: null, // Optional dependency, can be null
        },
      ],
    });
    service = TestBed.inject(RoutingConfigServiceImpl);
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

      expect(result).toEqual(undefined);
    });
  });
});

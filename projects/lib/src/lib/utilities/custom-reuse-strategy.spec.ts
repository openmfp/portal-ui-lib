import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { CustomReuseStrategy } from './custom-reuse-strategy';

describe('CustomReuseStrategy', () => {
  let strategy: CustomReuseStrategy;

  beforeEach(() => {
    strategy = new CustomReuseStrategy();
  });

  describe('shouldReuseRoute', () => {
    it('should return true when route configs are the same', () => {
      const routeConfig = { path: 'test' };
      const future = { routeConfig } as ActivatedRouteSnapshot;
      const curr = { routeConfig } as ActivatedRouteSnapshot;

      expect(strategy.shouldReuseRoute(future, curr)).toBe(true);
    });

    it('should return true when route components are the same', () => {
      const TestComponent = class {};
      const future = {
        routeConfig: { component: TestComponent },
      } as ActivatedRouteSnapshot;
      const curr = {
        routeConfig: { component: TestComponent },
      } as ActivatedRouteSnapshot;

      expect(strategy.shouldReuseRoute(future, curr)).toBe(true);
    });

    it('should return false when route configs and components are different', () => {
      const TestComponent1 = class {};
      const TestComponent2 = class {};
      const future = {
        routeConfig: { component: TestComponent1 },
      } as ActivatedRouteSnapshot;
      const curr = {
        routeConfig: { component: TestComponent2 },
      } as ActivatedRouteSnapshot;

      expect(strategy.shouldReuseRoute(future, curr)).toBe(false);
    });

    it('should return false when one route config is undefined', () => {
      const TestComponent = class {};
      const future = { routeConfig: undefined } as unknown as ActivatedRouteSnapshot;
      const curr = {
        routeConfig: { component: TestComponent },
      } as ActivatedRouteSnapshot;

      expect(strategy.shouldReuseRoute(future, curr)).toBe(false);
    });
  });

  describe('shouldDetach', () => {
    it('should always return false', () => {
      const route = {} as ActivatedRouteSnapshot;
      expect(strategy.shouldDetach(route)).toBe(false);
    });
  });

  describe('store', () => {
    it('should not throw when called', () => {
      const route = {} as ActivatedRouteSnapshot;
      const handle = {} as DetachedRouteHandle;
      expect(() => strategy.store(route, handle)).not.toThrow();
    });
  });

  describe('shouldAttach', () => {
    it('should always return false', () => {
      const route = {} as ActivatedRouteSnapshot;
      expect(strategy.shouldAttach(route)).toBe(false);
    });
  });

  describe('retrieve', () => {
    it('should always return null', () => {
      const route = {} as ActivatedRouteSnapshot;
      expect(strategy.retrieve(route)).toBeNull();
    });
  });
});

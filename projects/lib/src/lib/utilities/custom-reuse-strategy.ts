import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Optionally, you can customize which routes should be detached (stored)
    return false; // Not detaching any routes for now
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    // Optional: Store the detached route here if needed
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Optional: Specify which routes to reattach
    return false; // Not attaching any routes for now
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Optional: Retrieve the stored route if needed
    return null; // Returning null means no route is retrieved
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return (
      future.routeConfig === curr.routeConfig ||
      future.routeConfig?.component === curr.routeConfig?.component
    );
  }
}

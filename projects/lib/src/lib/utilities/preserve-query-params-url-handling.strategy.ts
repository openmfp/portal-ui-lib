import { UrlHandlingStrategy, UrlTree } from '@angular/router';

export class PreserveQueryParamsUrlHandlingStrategy
  implements UrlHandlingStrategy
{
  shouldProcessUrl(url: UrlTree): boolean {
    return true;
  }

  extract(url: UrlTree): UrlTree {
    return url;
  }

  merge(newUrlPart: UrlTree, wholeUrl: UrlTree): UrlTree {
    const routerHasNoQueryParams =
      !newUrlPart.queryParams ||
      Object.keys(newUrlPart.queryParams).length === 0;

    const liveParams = Object.fromEntries(new URLSearchParams(location.search));

    if (routerHasNoQueryParams && Object.keys(liveParams).length > 0) {
      newUrlPart.queryParams = liveParams;
    }

    return newUrlPart;
  }
}

import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
// @ts-ignore
import * as url from 'url';
import { AuthService } from '../services';

@Component({
  template: '',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CallbackComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.route.queryParams.subscribe((queryParams) => {
      const code = queryParams['code'];
      const state = queryParams['state'];
      return this.processAuthData(code, state);
    });
  }

  private async navigateToLogoutWithLoginError() {
    await this.router.navigate(['/logout'], {
      queryParams: { error: 'loginError' },
    });
  }

  private async processAuthData(code: string, state: string) {
    try {
      const appStateUrl = this.createAppStateUrl(state);

      if (!code || !this.stateOriginMatchesOrigin(appStateUrl)) {
        return this.navigateToLogoutWithLoginError();
      }

      await this.authService.auth(code, state);

      return this.router.navigate(
        [appStateUrl.pathname],
        this.createNavigationParams(appStateUrl)
      );
    } catch (e) {
      this.navigateToLogoutWithLoginError();
    }
  }

  private stateOriginMatchesOrigin(appStateUrl: url.URL) {
    return appStateUrl.origin === globalThis.location.origin;
  }

  private createAppStateUrl(state: string): url.URL {
    const decodedState = atob(decodeURIComponent(state)).split('_luigiNonce=');
    const appState = decodeURI(decodedState[0] || '');
    return new URL(appState);
  }

  private createNavigationParams(appStateUrl: url.URL): NavigationExtras {
    // appstate an absolute url, so needs some handling
    const extras: NavigationExtras = {};
    if (appStateUrl.searchParams) {
      extras.queryParams = {};
      appStateUrl.searchParams.forEach((value: string, key: string) => {
        if (extras.queryParams) {
          extras.queryParams[key] = value;
        }
      });
    }
    if (appStateUrl.hash?.length > 1) {
      extras.fragment = appStateUrl.hash.substr(1);
      extras.preserveFragment = true;
    }
    return extras;
  }
}

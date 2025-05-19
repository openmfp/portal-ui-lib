import {
  AuthService,
  LoginEventService,
  LoginEventType,
  LuigiCoreService,
} from '../../services';
import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as url from 'url';

@Component({
  template: '',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
})
export class CallbackComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loginEventService: LoginEventService,
  ) {
    this.route.queryParams.subscribe((queryParams) => {
      const code = queryParams['code'];
      const state = queryParams['state'];
      return this.processAuthData(code, state);
    });
  }

  private async triggerLogoutEventWithError() {
    this.loginEventService.loginEvent({
      type: LoginEventType.LOGOUT_TRIGGERED,
      queryParams: { error: 'loginError' },
    });
  }

  private async processAuthData(code: string, state: string) {
    try {
      const appStateUrl = this.createAppStateUrl(state);
      if (
        !code ||
        (!this.isSameOrigin(appStateUrl) && !this.isSubDomain(appStateUrl))
      ) {
        return this.triggerLogoutEventWithError();
      }

      await this.authService.auth(code, state);
      if (this.isSubDomain(appStateUrl)) {
        window.location.href = appStateUrl.href;
      } else {
        return this.router.navigate(
          [appStateUrl.pathname],
          this.createNavigationParams(appStateUrl),
        );
      }
    } catch (e) {
      this.triggerLogoutEventWithError();
    }
  }

  private isSameOrigin(appStateUrl: url.URL) {
    const current = new URL(globalThis.location.href);
    return appStateUrl.origin === current.origin;
  }

  private isSubDomain(appStateUrl: url.URL) {
    const current = new URL(globalThis.location.href);
    const app = appStateUrl;
    const isSameProtocolAndPort =
      app.protocol === current.protocol && app.port === current.port;
    const isSubdomain =
      app.hostname !== current.hostname &&
      app.hostname.endsWith('.' + current.hostname);

    return isSubdomain && isSameProtocolAndPort;
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

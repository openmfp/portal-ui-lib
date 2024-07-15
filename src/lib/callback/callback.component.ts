import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as url from 'url';
import { AuthService } from '../services/auth.service';

@Component({
  template: '<p>hello</p>',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CallbackComponent {
  // constructor(
  //   private route: ActivatedRoute,
  //   private router: Router,
  //   private authService: AuthService
  // ) {
  //   debugger;
  //   this.route.queryParams.subscribe((queryParams) => {
  //     debugger;
  //     const code = queryParams['code'];
  //     const state = queryParams['state'];
  //     return this.processAuthData(code, state);
  //   });
  // }
  //
  // login() {
  //   return this.router.navigate(['/']);
  // }
  //
  // private async displayLoginError() {
  //   await this.router.navigate(['/logout'], {
  //     queryParams: { error: 'loginError' },
  //   });
  // }
  //
  // private async processAuthData(code: string, state: string) {
  //   debugger;
  //   try {
  //     const appStateUrl = this.createAppStateUrl(state);
  //
  //     if (!code || !this.stateOriginMatchesOrigin(appStateUrl)) {
  //       return this.displayLoginError();
  //     }
  //
  //     await this.authService.auth(code, state);
  //
  //     return this.router.navigate(
  //       [appStateUrl.pathname],
  //       this.createNavigationParams(appStateUrl)
  //     );
  //   } catch (e) {
  //     this.displayLoginError();
  //   }
  // }
  //
  // private stateOriginMatchesOrigin(appStateUrl: url.URL) {
  //   return appStateUrl.origin === globalThis.location.origin;
  // }
  //
  // private createAppStateUrl(state: string): url.URL {
  //   const decodedState = atob(decodeURIComponent(state)).split('_luigiNonce=');
  //   const appState = decodeURI(decodedState[0] || '');
  //   return new URL(appState);
  // }
  //
  // private createNavigationParams(appStateUrl: url.URL): NavigationExtras {
  //   // appstate an absolute url, so needs some handling
  //   const extras: NavigationExtras = {};
  //   if (appStateUrl.searchParams) {
  //     extras.queryParams = {};
  //     appStateUrl.searchParams.forEach((value, key) => {
  //       if (extras.queryParams) {
  //         extras.queryParams[key] = value;
  //       }
  //     });
  //   }
  //   if (appStateUrl.hash?.length > 1) {
  //     extras.fragment = appStateUrl.hash.substr(1);
  //   }
  //   return extras;
  // }
}

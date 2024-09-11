import { Inject, Injectable } from '@angular/core';
import oAuth2 from '@luigi-project/plugin-auth-oauth2';
import { LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { AuthEvent } from '../../models';
import { LuigiAuthEventsCallbacksService } from '../luigi-auth-events-callbacks.service';
import { AuthService } from '../portal';

@Injectable({
  providedIn: 'root',
})
export class AuthConfigService {
  constructor(
    private authService: AuthService,
    @Inject(LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN)
    private luigiAuthEventsCallbacksService: LuigiAuthEventsCallbacksService
  ) {}

  public getAuthConfig(oauthServerUrl: string, clientId: string) {
    return {
      use: 'oAuth2AuthCode',
      storage: 'none',
      oAuth2AuthCode: {
        idpProvider: oAuth2,
        authorizeUrl: oauthServerUrl,
        logoutUrl: '/rest/logout',
        oAuthData: {
          client_id: clientId,
          scope: 'openid',
          redirect_uri: '/callback',
          response_type: 'code',
        },
        accessTokenExpiringNotificationTime: 60,
        expirationCheckInterval: 5,
        userInfoFn: () => {
          const uinfo = this.authService.getUserInfo();

          return new Promise((resolve) => {
            fetch(uinfo.picture, {
              method: 'HEAD',
              mode: 'no-cors',
            })
              .then(() => {
                resolve(uinfo);
              })
              .catch(() => {
                uinfo.picture = '';
                resolve(uinfo);
              });
          });
        },
      },
      disableAutoLogin: false,
      events: {
        onAuthSuccessful: (settings, authData) => {
          this.authService.authEvent(AuthEvent.AUTH_SUCCESSFUL);
          this.luigiAuthEventsCallbacksService.onAuthSuccessful(
            settings,
            authData
          );
        },
        onAuthError: (settings, err) => {
          this.authService.authEvent(AuthEvent.AUTH_ERROR);
          this.luigiAuthEventsCallbacksService.onAuthError(settings, err);
        },
        onAuthExpired: (settings) => {
          this.authService.authEvent(AuthEvent.AUTH_EXPIRED);
          this.luigiAuthEventsCallbacksService.onAuthExpired(settings);
        },
        onLogout: (settings) => {
          this.authService.authEvent(AuthEvent.LOGOUT);
          this.luigiAuthEventsCallbacksService.onLogout(settings);
        },
        onAuthExpireSoon: (settings) => {
          this.authService.authEvent(AuthEvent.AUTH_EXPIRE_SOON);
          this.luigiAuthEventsCallbacksService.onAuthExpireSoon(settings);
        },
        onAuthConfigError: (settings, err) => {
          this.authService.authEvent(AuthEvent.AUTH_CONFIG_ERROR);
          this.luigiAuthEventsCallbacksService.onAuthConfigError(settings, err);
        },
      },
    };
  }
}

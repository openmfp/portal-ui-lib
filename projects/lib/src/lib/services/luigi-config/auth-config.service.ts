import { LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { AuthEvent } from '../../models';
import { AuthService, EnvConfigService } from '../portal';
import { LuigiAuthEventsCallbacksService } from './luigi-auth-events-callbacks.service';
import { Injectable, inject } from '@angular/core';
import oAuth2 from '@luigi-project/plugin-auth-oauth2';

@Injectable({
  providedIn: 'root',
})
export class AuthConfigService {
  private authService = inject(AuthService);
  private envConfigService = inject(EnvConfigService);
  private luigiAuthEventsCallbacksService =
    inject<LuigiAuthEventsCallbacksService>(
      LUIGI_AUTH_EVENTS_CALLBACKS_SERVICE_INJECTION_TOKEN as any,
      { optional: true },
    );

  public async getAuthConfig() {
    const { oauthServerUrl, clientId } =
      await this.envConfigService.getEnvConfig();

    if (!oauthServerUrl || !clientId) {
      return undefined;
    }
    return {
      use: 'oAuth2AuthCode',
      storage: 'none',
      oAuth2AuthCode: {
        idpProvider: oAuth2,
        authorizeUrl: oauthServerUrl,
        logoutUrl: '/rest/logout',
        post_logout_redirect_uri: '/logout',
        oAuthData: {
          client_id: clientId,
          scope: 'openid',
          redirect_uri: '/callback',
          response_type: 'code',
        },
        accessTokenExpiringNotificationTime: 60,
        expirationCheckInterval: 5,
        userInfoFn: () => {
          const userInfo = this.authService.getUserInfo();

          return new Promise((resolve) => {
            fetch(userInfo.picture, {
              method: 'HEAD',
              mode: 'no-cors',
            })
              .then(() => {
                resolve(userInfo);
              })
              .catch(() => {
                userInfo.picture = '';
                resolve(userInfo);
              });
          });
        },
      },
      disableAutoLogin: false,
      events: {
        onAuthSuccessful: (settings, authData) => {
          this.authService.authEvent(AuthEvent.AUTH_SUCCESSFUL);
          this.luigiAuthEventsCallbacksService?.onAuthSuccessful(
            settings,
            authData,
          );
        },
        onAuthError: (settings, err) => {
          this.authService.authEvent(AuthEvent.AUTH_ERROR);
          this.luigiAuthEventsCallbacksService?.onAuthError(settings, err);
        },
        onAuthExpired: (settings) => {
          this.authService.authEvent(AuthEvent.AUTH_EXPIRED);
          this.luigiAuthEventsCallbacksService?.onAuthExpired(settings);
        },
        onLogout: (settings) => {
          this.authService.authEvent(AuthEvent.LOGOUT);
          this.luigiAuthEventsCallbacksService?.onLogout(settings);
        },
        onAuthExpireSoon: (settings) => {
          this.authService.authEvent(AuthEvent.AUTH_EXPIRE_SOON);
          this.luigiAuthEventsCallbacksService?.onAuthExpireSoon(settings);
        },
        onAuthConfigError: (settings, err) => {
          this.authService.authEvent(AuthEvent.AUTH_CONFIG_ERROR);
          this.luigiAuthEventsCallbacksService?.onAuthConfigError(
            settings,
            err,
          );
        },
      },
    };
  }
}

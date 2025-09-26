import {
  I18nService,
  LoginEventService,
  LoginEventType,
  LuigiCoreService,
} from '../../services';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutComponent implements OnInit {
  headline = signal<string>('');
  hint = signal<string>('');
  btnText = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private luigiCoreService: LuigiCoreService,
    private i18nService: I18nService,
    private loginEventService: LoginEventService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.luigiCoreService.ux().hideAppLoadingIndicator();
    const error = this.route.snapshot.queryParams['error'];

    const translations = await this.getTranslations();
    this.headline.set(translations.headlineSuccessfullyLoggedOut);
    this.hint.set(translations.hintSignIn);
    this.btnText.set(translations.btnTextLoginAgain);

    switch (error) {
      case 'tokenExpired':
        this.headline.set(translations.headlineSessionExpired);
        break;
      case 'loginError':
        this.headline.set(translations.headlineSigInError);
        this.hint.set(translations.hintSignInError);
        break;
      case 'invalidToken':
        this.luigiCoreService.removeAuthData();
        this.headline.set(translations.headlineInvalidTokenError);
        this.hint.set(translations.hintInvalidTokenError);
        break;
      default:
        break;
    }
  }

  login() {
    this.loginEventService.loginEvent({ type: LoginEventType.LOGIN_TRIGGERED });
  }

  private async getTranslations() {
    return {
      headlineSuccessfullyLoggedOut: await this.i18nService.getTranslationAsync(
        'SUCCESSFULLY_LOGGED_OUT',
      ),
      hintSignIn: await this.i18nService.getTranslationAsync('SIGN_IN_HINT'),
      btnTextLoginAgain:
        await this.i18nService.getTranslationAsync('LOGIN_AGAIN'),
      headlineSessionExpired:
        await this.i18nService.getTranslationAsync('SESSION_EXPIRED'),

      headlineSigInError:
        await this.i18nService.getTranslationAsync('SIGN_IN_ERROR'),
      hintSignInError:
        await this.i18nService.getTranslationAsync('SIGN_IN_ERROR_HINT'),

      headlineInvalidTokenError: await this.i18nService.getTranslationAsync(
        'INVALID_TOKEN_ERROR',
      ),
      hintInvalidTokenError: await this.i18nService.getTranslationAsync(
        'INVALID_TOKEN_ERROR_HINT',
      ),
    };
  }
}

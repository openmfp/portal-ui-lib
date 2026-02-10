import { Inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NAVIGATION_REDIRECT_STRATEGY_INJECTION_TOKEN } from '../injection-tokens';
import { AuthEvent } from '../models';
import { LoginEventService, LoginEventType } from './login-event.service';
import { NavigationRedirectStrategy } from './navigation-redirect-strategy';
import { AuthService } from './portal';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private lastUrl: string = '/';

  constructor(
    private router: Router,
    private authService: AuthService,
    private loginEventService: LoginEventService,
    @Inject(NAVIGATION_REDIRECT_STRATEGY_INJECTION_TOKEN)
    private navigationRedirectStrategy: NavigationRedirectStrategy,
  ) {}

  track() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.lastUrl = event.url;
      });

    this.authService.authEvents
      .pipe(
        filter(
          (event) =>
            event === AuthEvent.AUTH_EXPIRED || event === AuthEvent.LOGOUT,
        ),
      )
      .subscribe(() => {
        this.saveRedirectUrl();
      });

    this.loginEventService.loginEvents
      .pipe(filter((event) => event.type === LoginEventType.LOGIN_TRIGGERED))
      .subscribe((event) => {
        this.router.navigate([this.getRedirectUrl()], {
          queryParams: event.queryParams,
        });
        this.clearRedirectUrl();
      });
  }

  private saveRedirectUrl(): void {
    this.navigationRedirectStrategy.saveRedirectUrl(this.lastUrl);
  }

  private clearRedirectUrl(): void {
    this.navigationRedirectStrategy.clearRedirectUrl();
  }

  private getRedirectUrl(): string {
    return this.navigationRedirectStrategy.getRedirectUrl();
  }
}

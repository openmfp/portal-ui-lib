import { AuthEvent } from '../models';
import { NAVIGATION_REDIRECT_STRATEGY_INJECTION_TOKEN } from '../injection-tokens';
import { LoginEventService, LoginEventType } from './login-event.service';
import { AuthService } from './portal';
import { NavigationRedirectStrategy } from './navigation-redirect-strategy';
import { Injectable, Inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentUrl: string;
  private previousUrl: string;

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
        this.currentUrl = event.url;
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.previousUrl = event.url;
      });

    this.authService.authEvents
      .pipe(filter((event) => event === AuthEvent.AUTH_EXPIRED))
      .subscribe({ next: () => this.saveCurrentUrl() });

    this.authService.authEvents
      .pipe(filter((event) => event === AuthEvent.LOGOUT))
      .subscribe({
        next: () => {
          this.saveLastNavigationUrl();
        },
      });

    this.loginEventService.loginEvents
      .pipe(filter((event) => event.type === LoginEventType.LOGIN_TRIGGERED))
      .subscribe({
        next: (event) => {
          this.router.navigate([this.getRedirectUrl()], {
            queryParams: event.queryParams,
          });
          this.clearCurrentUrl();
        },
      });
  }

  private clearCurrentUrl() {
    this.navigationRedirectStrategy.clearRedirectUrl();
  }

  private saveCurrentUrl(): void {
    this.navigationRedirectStrategy.saveRedirectUrl(this.currentUrl);
  }

  private saveLastNavigationUrl(): void {
    this.navigationRedirectStrategy.saveLastNavigationUrl(this.previousUrl);
  }

  private getRedirectUrl(): string {
    return this.navigationRedirectStrategy.getRedirectUrl();
  }
}

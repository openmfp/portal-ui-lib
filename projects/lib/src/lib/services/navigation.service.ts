import { AuthEvent } from '../models';
import { LoginEventService, LoginEventType } from './login-event.service';
import { AuthService } from './portal';
import { LocalStorageKeys } from './storage-service';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentUrl: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loginEventService: LoginEventService,
  ) {}

  track() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
      });

    this.authService.authEvents
      .pipe(filter((event) => event === AuthEvent.AUTH_EXPIRED))
      .subscribe({ next: () => this.saveCurrentUrl() });

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

    this.loginEventService.loginEvents
      .pipe(filter((event) => event.type === LoginEventType.LOGOUT_TRIGGERED))
      .subscribe({
        next: (event) => {
          this.saveCurrentUrl();
          this.router.navigate(['/logout'], {
            queryParams: event.queryParams,
          });
        },
      });
  }

  private clearCurrentUrl() {
    localStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, '');
  }

  private saveCurrentUrl(): void {
    localStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, this.currentUrl);
  }

  private getRedirectUrl(): string {
    return localStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL) || '/';
  }
}

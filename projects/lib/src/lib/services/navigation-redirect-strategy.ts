import { LocalStorageKeys } from './storage-service';
import { Injectable } from '@angular/core';

export interface NavigationRedirectStrategy {
  getRedirectUrl(): string;
  saveRedirectUrl(url: string): void;
  clearRedirectUrl(): void;
}

@Injectable()
export class DefaultNavigationRedirectStrategy implements NavigationRedirectStrategy {
  getRedirectUrl(): string {
    return localStorage.getItem(LocalStorageKeys.LAST_NAVIGATION_URL) || '/';
  }

  saveRedirectUrl(url: string): void {
    localStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, url);
  }

  clearRedirectUrl(): void {
    localStorage.setItem(LocalStorageKeys.LAST_NAVIGATION_URL, '');
  }
}

import { Injectable } from '@angular/core';

export interface UserProfileItem {
  label?: string;
  icon?: string;
  link?: string;
}

export interface UserProfile {
  logout: UserProfileItem;
  items: UserProfileItem[];
}

export interface UserProfileConfigService {
  getProfile(): Promise<UserProfile>;
}

@Injectable({ providedIn: 'root' })
export class NoopUserProfileConfigService implements UserProfileConfigService {
  async getProfile() {
    return undefined;
  }
}

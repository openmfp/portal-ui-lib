import { Injectable } from '@angular/core';

export interface UserProfileConfigService {
  getProfile(): Promise<any>;
}

@Injectable({ providedIn: 'root' })
export class NoopUserProfileConfigService implements UserProfileConfigService {
  getProfile() {
    return undefined;
  }
}

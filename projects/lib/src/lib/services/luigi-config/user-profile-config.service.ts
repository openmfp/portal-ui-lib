export interface UserProfileItem {
  label?: string;
  icon?: string;
  link?: string;
}

export interface UserProfile {
  logout: UserProfileItem;
  items: UserProfileItem[];
}

export class UserProfileConfigService {
  getProfile(): Promise<UserProfile> {
    return null;
  }
}

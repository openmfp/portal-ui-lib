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

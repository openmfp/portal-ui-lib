export interface ExternalLink {
  sameWindow: boolean;
  URL: string;
}

export interface OpenNodeInModal {
  title?: string;
  size?: 's' | 'm' | 'l';
  width?: string;
  height?: string;
}

export interface UserProfileItem {
  label?: string;
  icon?: string;
  link?: string;
  openNodeInModal?: boolean | OpenNodeInModal;
  externalLink?: ExternalLink;
}

export interface UserProfile {
  logout?: UserProfileItem;
  items: UserProfileItem[];
}

export interface UserProfileConfigService {
  getProfile(): Promise<UserProfile>;
}

export class DefaultUserProfileConfigService
  implements UserProfileConfigService
{
  async getProfile(): Promise<UserProfile> {
    return {
      items: [],
    };
  }
}

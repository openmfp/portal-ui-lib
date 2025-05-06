import { Injectable } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class UserProfileConfigServiceImpl implements UserProfileConfigService {
  async getProfile(): Promise<UserProfile> {
    return {
      items: [
        {
          label: 'PROFILE_ORGANIZATION',
          icon: 'building',
          link: '/organization-management',
          openNodeInModal: {
            width: '360px',
            height: '260px',
          },
        },
      ],
    };
  }
}

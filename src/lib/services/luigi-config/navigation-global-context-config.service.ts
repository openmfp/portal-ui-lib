import { Injectable } from '@angular/core';
import { AuthService } from '../portal';

export interface NavigationGlobalContextConfigService {
  getGlobalContext(): Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class NavigationGlobalContextConfigServiceImpl
  implements NavigationGlobalContextConfigService
{
  constructor(private authService: AuthService) {}

  getGlobalContext() {
    return {
      token: this.authService.getToken(),
    };
  }
}

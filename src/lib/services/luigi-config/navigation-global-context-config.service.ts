import { Injectable } from '@angular/core';
import { AuthService } from '../portal/auth.service';

export interface NavigationGlobalContextConfigService {
  getGlobalContext();
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

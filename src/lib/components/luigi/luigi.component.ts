import { Component } from '@angular/core';
import { AuthService } from '../../services';
import { LuigiCoreService, LuigiConfigService } from '../../services';

@Component({
  template: '',
  standalone: true,
})
export class LuigiComponent {
  constructor(
    private luigiConfigService: LuigiConfigService,
    private luigiCoreService: LuigiCoreService,
    private authService: AuthService
  ) {
    this.luigiConfigService
      .getLuigiConfiguration()
      .then((config) => {
        this.luigiCoreService.setConfig(config);
        this.luigiCoreService.setAuthData(this.authService.getAuthData());
      })
      .catch((e: Error) =>
        console.error(`Luigi Component init failed: ${e.toString()}`)
      );
  }
}

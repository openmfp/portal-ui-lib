import { Component } from '@angular/core';
import { AuthService } from '../services';
import { LuigiConfigService } from '../services/luigi-config/luigi-config.service';
import { LuigiCoreService } from '../services';

@Component({
  template: '',
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
        this.luigiCoreService
          .auth()
          .store.setAuthData(this.authService.getAuthData());
      })
      .catch((e: Error) =>
        console.error(`Luigi Component init failed: ${e.toString()}`)
      );
  }
}

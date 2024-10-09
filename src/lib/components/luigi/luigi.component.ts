import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
        this.luigiCoreService
          .auth()
          .store.setAuthData(this.authService.getAuthData());
        this.luigiCoreService.auth().store.setNewlyAuthorized();
      })
      .catch((e: Error) =>
        console.error(`Luigi Component init failed: ${e.toString()}`)
      );
  }
}

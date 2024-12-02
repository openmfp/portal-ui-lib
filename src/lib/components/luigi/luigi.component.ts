import { Component, OnInit } from '@angular/core';
import { AuthService, LuigiConfigService } from '../../services';
import { LuigiCoreService } from '../../services';

@Component({
  template: '',
  standalone: true,
})
export class LuigiComponent implements OnInit {
  constructor(
    private luigiConfigService: LuigiConfigService,
    private luigiCoreService: LuigiCoreService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const config = await this.luigiConfigService.getLuigiConfiguration();
      this.luigiCoreService.setConfig(config);
      this.luigiCoreService.setAuthData(this.authService.getAuthData());
    } catch (e) {
      console.error(`Luigi Component init failed: ${e.toString()}`);
    }
  }
}

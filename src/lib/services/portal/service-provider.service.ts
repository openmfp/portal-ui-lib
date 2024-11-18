import { Injectable } from '@angular/core';
import { PortalConfig, ServiceProvider } from '../../models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceProviderService {
  constructor(private configService: ConfigService) {}

  clearCache(): void {
    this.configService.clearEntityConfigCache();
  }

  async getRawConfigs(): Promise<ServiceProvider[]> {
    return this.configService
      .getPortalConfig()
      .then((portalConfig: PortalConfig) => portalConfig.providers || []);
  }

  async getRawConfigsForEntity(
    entity: string,
    context?: Record<string, string>
  ): Promise<ServiceProvider[]> {
    return this.configService
      .getEntityConfig(entity, context)
      .then((entityConfig) => entityConfig.providers || []);
  }
}

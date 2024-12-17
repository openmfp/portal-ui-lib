import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EntityConfig, PortalConfig } from '../../models';
import { RequestHeadersService } from '../request-headers.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private portalConfigCachePromise: Promise<PortalConfig>;

  private entityConfigCache: Record<
    string /* entity */,
    Record<string /* ctx */, EntityConfig>
  > = {};

  constructor(
    private http: HttpClient,
    private requestHeadersService: RequestHeadersService
  ) {}

  async getPortalConfig(): Promise<PortalConfig> {
    if (this.portalConfigCachePromise) {
      return this.portalConfigCachePromise;
    }

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    this.portalConfigCachePromise = firstValueFrom(
      this.http.get<PortalConfig>('/rest/config', options)
    ).catch((e) => {
      if (e instanceof HttpErrorResponse && e.status === 403) {
        window.location.assign('/logout?error=invalidToken');
      }
      throw e;
    });

    return this.portalConfigCachePromise;
  }

  async getEntityConfig(
    entity: string,
    context?: Record<string, string>
  ): Promise<EntityConfig> {
    if (!this.entityConfigCache[entity]) {
      this.entityConfigCache[entity] = {};
    }

    const entityCacheKey = JSON.stringify(context);
    if (this.entityConfigCache[entity][entityCacheKey]) {
      return this.entityConfigCache[entity][entityCacheKey];
    }

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    const entityConfig = await firstValueFrom(
      this.http.get<EntityConfig>(`/rest/config/${entity}`, {
        ...options,
        ...{ params: context },
      })
    );

    throw new HttpErrorResponse({ status: 404 });
    this.entityConfigCache[entity][entityCacheKey] = entityConfig;
    return entityConfig;
  }

  clearEntityConfigCache(): void {
    this.entityConfigCache = {};
  }
}

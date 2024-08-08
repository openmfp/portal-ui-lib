import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EntityConfig, PortalConfig } from '../../models/portal';
import { RequestHeadersService } from '../request-headers.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private portalConfigCache: Promise<PortalConfig>;

  private entityConfigCache: Record<
    string /* entity */,
    Record<string /* ctx */, Promise<EntityConfig>>
  > = {};

  constructor(
    private http: HttpClient,
    private requestHeadersService: RequestHeadersService
  ) {}

  async getPortalConfig(): Promise<PortalConfig> {
    if (this.portalConfigCache) {
      return this.portalConfigCache;
    }

    // cache response, since it gets called multiple times due to Luigi internals
    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    this.portalConfigCache = firstValueFrom(
      this.http.get<PortalConfig>('/rest/config', options)
    ).catch((e) => {
      if (e instanceof HttpErrorResponse && e.status === 403) {
        window.location.assign('/logout?error=invalidToken');
      }
      throw e;
    });

    return this.portalConfigCache;
  }

  async getEntityConfig(
    entity: string,
    context?: Record<string, string>
  ): Promise<EntityConfig> {
    const entityCacheKey = JSON.stringify(context);
    if (
      this.entityConfigCache[entity] &&
      this.entityConfigCache[entity][entityCacheKey]
    ) {
      return this.entityConfigCache[entity][entityCacheKey];
    }

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    const entityConfig = firstValueFrom(
      this.http.get<EntityConfig>(`/rest/config/${entity}`, {
        ...options,
        ...{ params: context },
      })
    ).catch((e) => {
      if (e instanceof HttpErrorResponse && e.status === 403) {
        window.location.assign('/logout?error=invalidToken');
      }
      throw e;
    });

    if (!this.entityConfigCache[entity]) {
      this.entityConfigCache[entity] = {};
    }
    this.entityConfigCache[entity][entityCacheKey] = entityConfig;
    return entityConfig;
  }

  clearEntityConfigCache(): void {
    this.entityConfigCache = {};
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { EntityConfig, PortalConfig } from '../../models';
import { RequestHeadersService } from '../request-headers.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private portalConfigCache: PortalConfig;

  private entityConfigCache: Record<
    string /* entity */,
    Record<string /* ctx */, EntityConfig>
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
    try {
      await firstValueFrom(
        this.http
          .get<PortalConfig>('/rest/config', options)
          .pipe(tap((config) => (this.portalConfigCache = config)))
      );
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 403) {
        window.location.assign('/logout?error=invalidToken');
      }
      throw e;
    }

    return this.portalConfigCache;
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
    try {
      const entityConfig = await firstValueFrom(
        this.http.get<EntityConfig>(`/rest/config/${entity}`, {
          ...options,
          ...{ params: context },
        })
      );

      this.entityConfigCache[entity][entityCacheKey] = entityConfig;
      return entityConfig;
    } catch (e) {
      this.entityConfigCache[entity][entityCacheKey] = {
        providers: [],
        entityContext: {},
      };
      throw e;
    }
  }

  clearEntityConfigCache(): void {
    this.entityConfigCache = {};
  }
}

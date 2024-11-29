import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    try {
      await firstValueFrom(
        this.http.get<PortalConfig>('/rest/config', options).pipe(
          // cache response, since it gets called multiple times due to Luigi internals
          tap((config: PortalConfig) => (this.portalConfigCache = config))
        )
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
    const entityConfig = await firstValueFrom(
      this.http.get<EntityConfig>(`/rest/config/${entity}`, {
        ...options,
        ...{ params: context },
      })
    );

    this.entityConfigCache[entity][entityCacheKey] = entityConfig;
    return entityConfig;
  }

  clearEntityConfigCache(): void {
    this.entityConfigCache = {};
  }
}

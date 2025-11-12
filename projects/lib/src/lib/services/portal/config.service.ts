import { EntityConfig, PortalConfig } from '../../models';
import { RequestHeadersService } from '../request-headers.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private portalConfigCachePromise: Promise<PortalConfig> | undefined;

  private entityConfigCache: Record<
    string /* entity */,
    Record<string /* ctx */, Promise<EntityConfig>>
  > = {};

  constructor(
    private http: HttpClient,
    private requestHeadersService: RequestHeadersService,
  ) {}

  async getPortalConfig(): Promise<PortalConfig> {
    if (this.portalConfigCachePromise) {
      return this.portalConfigCachePromise;
    }

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    this.portalConfigCachePromise = firstValueFrom(
      this.http.get<PortalConfig>('/rest/config', options),
    ).catch((e) => {
      if (e instanceof HttpErrorResponse && e.status === 403) {
        window.location.assign('/logout?error=invalidToken');
      }
      throw e;
    });

    return this.portalConfigCachePromise;
  }

  async reloadConfig(
    entity: string,
    context?: Record<string, string>,
  ): Promise<void> {
    if (!entity) {
      this.portalConfigCachePromise = undefined;
      await this.getPortalConfig();
    } else {
      try {
        const entityCacheKey = JSON.stringify(context);
        delete this.entityConfigCache[entity][entityCacheKey];
      } catch (e) {
        console.debug(
          `Error deleting entity config cache for entity: ${entity}, context: ${JSON.stringify(context)}, cache: ${JSON.stringify(this.entityConfigCache)}`,
          e,
        );
      }

      await this.getEntityConfig(entity, context);
    }
  }

  async getEntityConfig(
    entity: string,
    context?: Record<string, string>,
  ): Promise<EntityConfig> {
    if (!this.entityConfigCache[entity]) {
      this.entityConfigCache[entity] = {};
    }

    const entityCacheKey = JSON.stringify(context);
    const cachedConfig = this.entityConfigCache[entity][entityCacheKey];
    if (cachedConfig) {
      return cachedConfig;
    }

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    const entityConfig = firstValueFrom(
      this.http.get<EntityConfig>(`/rest/config/${entity}`, {
        ...options,
        ...{ params: context },
      }),
    );

    this.entityConfigCache[entity][entityCacheKey] = entityConfig;
    return entityConfig;
  }

  clearEntityConfigCache(): void {
    this.entityConfigCache = {};
  }
}

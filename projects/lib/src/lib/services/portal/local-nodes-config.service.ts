import { HttpClient } from '@angular/common/http';
import { ContentConfiguration, LuigiNode } from '../../models';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { LuigiCoreService } from '../luigi-core.service';

@Injectable({
  providedIn: 'root',
})
export class LocalNodesConfigService {
  constructor(
    private http: HttpClient,
    private luigiCoreService: LuigiCoreService
  ) {}

  async getLuigiNodesFromConfigurations(
    contentConfigurations: ContentConfiguration[]
  ): Promise<LuigiNode[]> {
    if (contentConfigurations.length === 0) {
      return null;
    }

    const language = this.luigiCoreService.i18n().getCurrentLocale();
    return await lastValueFrom(
      this.http.post<LuigiNode[]>(`/rest/localnodes`, {
        language,
        contentConfigurations,
      })
    );
  }
}

import { ContentConfiguration, LuigiNode } from '../../models';
import { TransformResult } from '../../models/node-transform';
import { LuigiCoreService } from '../luigi-core.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalNodesService {
  private http = inject(HttpClient);
  private luigiCoreService = inject(LuigiCoreService);

  async getLuigiNodesFromConfigurations(
    contentConfigurations: ContentConfiguration[],
  ): Promise<TransformResult> {
    if (contentConfigurations.length === 0) {
      return null;
    }

    const language = this.luigiCoreService.i18n().getCurrentLocale();
    return await lastValueFrom(
      this.http.post<TransformResult>(`/rest/localnodes`, {
        language,
        contentConfigurations,
      }),
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ClientEnvironment } from '../../models';
import { lastValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnvConfigService {
  private http = inject(HttpClient);
  private envConfigCache: ClientEnvironment;

  public async getEnvConfig(): Promise<ClientEnvironment> {
    if (this.envConfigCache) {
      return this.envConfigCache;
    }

    await lastValueFrom(
      this.http
        .get<ClientEnvironment>('/rest/envconfig')
        .pipe(tap((result) => (this.envConfigCache = result)))
    );

    return this.envConfigCache;
  }
}

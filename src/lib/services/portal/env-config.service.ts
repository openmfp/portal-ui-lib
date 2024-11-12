import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClientEnvironment } from '../../models';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnvConfigService {
  constructor(private http: HttpClient) {}

  public async getEnvConfig(): Promise<ClientEnvironment> {
    return lastValueFrom(this.http.get<ClientEnvironment>('/rest/envconfig'));
  }
}

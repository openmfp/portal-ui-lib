/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from "@angular/common/http";
import { LuigiNode } from "../../models";
import { Config } from "./dev-mode/dev-mode-settings";
import { lastValueFrom } from "rxjs";
import { stringify } from "querystring";

export interface LuigiDataConfigService {
  getLuigiDataFromConfigurations(
    configs: Config[],
    language: string,
  ): Promise<LuigiNode[]>;
}

export class PortalLuigiDataConfigService implements LuigiDataConfigService {
  constructor(private http: HttpClient) {}

  async getLuigiDataFromConfigurations(configs: Config[], language: string): Promise<LuigiNode[]> {
    return [];// Endpoint is not ready yet
    return await lastValueFrom(
      this.http.get<LuigiNode[]>(`/rest/localnodes`,{
        params: {
          configs: JSON.stringify({configs}),
          language: language
        }
      })
    )
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from "@angular/common/http";
import { LuigiNode } from "../../models";
import { Config } from "./dev-mode/dev-mode-settings";
import { lastValueFrom } from "rxjs";
import { Injectable } from "@angular/core";

export interface LuigiDataConfigService {
  getLuigiDataFromConfigurations(
    configs: Config[],
    language: string,
  ): Promise<LuigiNode[]>;
}

@Injectable({
  providedIn: 'root',
})
export class PortalLuigiDataConfigService implements LuigiDataConfigService {
  constructor(private http: HttpClient) {}

  async getLuigiDataFromConfigurations(): Promise<LuigiNode[]> {
    return await lastValueFrom(
      this.http.get<LuigiNode[]>(`/rest/localnodes`)
    )
  }
}

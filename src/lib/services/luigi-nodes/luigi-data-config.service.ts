/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from "@angular/common/http";
import { LuigiNode } from "../../models";
import { lastValueFrom } from "rxjs";
import { Injectable } from "@angular/core";
import { LuigiCoreService } from "../luigi-core.service";
import { DevModeSettings } from "./dev-mode/dev-mode-settings";

@Injectable({
  providedIn: 'root',
})
export class PortalLuigiDataConfigService {
  constructor(private http: HttpClient, private luigiCoreService: LuigiCoreService) {}

  async getLuigiDataFromConfigurations(devModeSettings: DevModeSettings): Promise<LuigiNode[]> {
    const language = this.luigiCoreService.i18n().getCurrentLocale();
    let configurations: Record<any, any>[] = [];

    if(devModeSettings.configs.length > 0) {
      configurations = await Promise.allSettled(
        devModeSettings.configs.map(async (config) => {
          let configuration: Record<any, any> = config.data;
          if (!configuration) {
            const response = await lastValueFrom(this.http.get(config.url));
            configuration = response;
          }
          return configuration;
        })
      );
    }

    return await lastValueFrom(
      this.http.get<LuigiNode[]>(`/rest/localnodes`,
        { ...{ params: {
        language,
        contentConfigurations:JSON.stringify(configurations)
      }}}
    )
    )
  }
}

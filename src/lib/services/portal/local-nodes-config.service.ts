import { HttpClient } from "@angular/common/http";
import { LuigiNode } from "../../models";
import { lastValueFrom } from "rxjs";
import { Injectable } from "@angular/core";
import { LuigiCoreService } from "../luigi-core.service";

@Injectable({
  providedIn: 'root',
})
export class LocalNodesConfigService {
  constructor(private http: HttpClient, private luigiCoreService: LuigiCoreService) {}

  async getLuigiNodesFromConfigurations(configurations: Record<any, any>[]): Promise<LuigiNode[]> {
    const language = this.luigiCoreService.i18n().getCurrentLocale();

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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from "@angular/common/http";
import { LuigiNode } from "../../models";
import { lastValueFrom } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class PortalLuigiDataConfigService {
  constructor(private http: HttpClient) {}

  async getLuigiDataFromConfigurations(): Promise<LuigiNode[]> {
    return await lastValueFrom(
      this.http.get<LuigiNode[]>(`/rest/localnodes`)
    )
  }
}

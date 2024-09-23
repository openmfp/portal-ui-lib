/* eslint-disable @typescript-eslint/no-unused-vars */
import { LuigiNode } from "../../models";
import { Config } from "./dev-mode/dev-mode-settings";

export interface LuigiDataConfigService {
  getLuigiDataFromConfigurations(
    configs: Config[],
    language: string,
  ): Promise<LuigiNode[]>;
}

export class NoopLuigiDataConfigService implements LuigiDataConfigService {
  async getLuigiDataFromConfigurations(configs: Config[], language: string): Promise<LuigiNode[]> {
    return [];
  }
}

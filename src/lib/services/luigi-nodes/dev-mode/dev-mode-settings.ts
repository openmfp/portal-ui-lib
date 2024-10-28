import { ContentConfiguration } from "../../../models";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Config {
  url?: string;
  data?: ContentConfiguration;
}
export interface DevModeSettings {
  configs: Config[];
  serviceProviderConfig: Record<string, string>;
}

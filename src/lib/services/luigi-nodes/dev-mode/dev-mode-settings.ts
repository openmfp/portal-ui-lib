/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Config {
  url?: string;
  data?: Record<any, any>;
}
export interface DevModeSettings {
  configs: Config[];
  serviceProviderConfig: Record<string, string>;
}

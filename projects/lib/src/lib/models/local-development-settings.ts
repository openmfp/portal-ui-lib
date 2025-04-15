import { ContentConfiguration } from './content-configuration';

export interface Config {
  url?: string;
  data?: ContentConfiguration;
}

export interface LocalDevelopmentSettings {
  isActive: boolean;
  configs: Config[];
  serviceProviderConfig: Record<string, string>;
}

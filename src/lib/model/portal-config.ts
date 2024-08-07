import { LuigiNode } from './luigi';

export interface ServiceProvider {
  nodes: LuigiNode[];
  config: Record<string, string>;
  installationData?: Record<string, string>;
  creationTimestamp: string;
}

export interface EntityConfig {
  providers: ServiceProvider[];
  entityContext: Record<string, any>;
}

export interface PortalConfig {
  providers: ServiceProvider[];
  tenantId: string;
  frameContext: Record<string, any>;
  featureToggles: Record<string, boolean>;
}

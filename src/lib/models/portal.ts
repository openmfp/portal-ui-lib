import { LuigiNode } from './luigi';

export interface ServiceProvider {
  nodes: LuigiNode[];
  config: Record<string, string>;
  installationData?: Record<string, string>;
  isMandatoryExtension?: boolean;
  creationTimestamp: string;
}

export interface EntityConfig {
  providers: ServiceProvider[];
  entityContext: Record<string, any>;
}

export interface PortalConfig {
  providers: ServiceProvider[];
  tenantId: string;
  portalContext: Record<string, any>;
  frameContext: Record<string, any>;
  featureToggles: Record<string, boolean>;
}

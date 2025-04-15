import { LuigiNode } from './luigi';

export interface ServiceProvider {
  name: string;
  displayName: string;
  creationTimestamp: string;
  nodes: LuigiNode[];
}

export interface EntityConfig {
  providers: ServiceProvider[];
  entityContext: Record<string, any>;
}

export interface PortalConfig {
  providers: ServiceProvider[];
  portalContext: Record<string, any>;
  featureToggles: Record<string, boolean>;
}

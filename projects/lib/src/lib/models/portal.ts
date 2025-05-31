import { LuigiNode } from './luigi';
import { PortalContext } from './luigi-context';

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
  portalContext: PortalContext;
  featureToggles: Record<string, boolean>;
}

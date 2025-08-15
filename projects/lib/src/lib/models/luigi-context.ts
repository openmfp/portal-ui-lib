import { EntityDefinition } from './luigi';
import { ResourceDefinition } from './resource';

export interface PortalContext extends Record<string, any> {}

export interface EntityContext extends Record<string, any> {}

export interface LuigiGlobalContext extends Record<string, any> {
  portalContext: PortalContext;
  userId: string;
  userEmail: string;
  token: string;
  portalBaseUrl: string;
}

export interface NodeContext extends LuigiGlobalContext {
  resourceDefinition?: ResourceDefinition;
  entityContext?: EntityContext;
  parentNavigationContexts?: string[];
  error?: {
    code: number;
    errorComponentConfig?: Record<string, any>;
    entityDefinition?: EntityDefinition;
    additionalContext?: Record<string, any>;
  };
  translationTable?: Record<string, any>;
  serviceProviderConfig?: Record<string, any>;
}

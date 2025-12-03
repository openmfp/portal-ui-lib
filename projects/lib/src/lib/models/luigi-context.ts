import { EntityDefinition } from './luigi';


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
  entityContext?: EntityContext;
  entityType?: string;
  parentNavigationContexts?: string[];
  error?: {
    code: number;
    entityDefinition?: EntityDefinition;
    additionalContext?: Record<string, any>;
  };
  translationTable?: Record<string, any>;
  serviceProviderConfig?: Record<string, any>;
}
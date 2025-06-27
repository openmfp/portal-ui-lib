import { EntityDefinition } from './luigi';
import { Resource, ResourceDefinition } from './resource';

export interface PortalContext extends Record<string, any> {
  crdGatewayApiUrl?: string;
}

export interface EntityContext extends Record<string, any> {
  account?: {
    id: string;
  };
}

export interface LuigiGlobalContext extends Record<string, any> {
  portalContext: PortalContext;
  userId: string;
  userEmail: string;
  token: string;
  organization: string;
}

export interface NodeContext extends LuigiGlobalContext {
  kcpPath?: string;
  resourceDefinition?: ResourceDefinition;
  entity?: Resource;
  entityId?: string;
  entityContext?: EntityContext;
  resourceId?: string; // to do remove
  accountId?: string;
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

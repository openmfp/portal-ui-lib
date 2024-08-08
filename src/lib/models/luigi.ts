export interface EntityDefinition {
  id: string;
  dynamicFetchId?: string;
  contextKey?: string;
  useBack?: boolean;
  label?: string;
  pluralLabel?: string;
  notFoundConfig?: {
    entityListNavigationContext: string;
    sapIllusSVG: string;
  };
}

export interface LuigiStatusBadge {
  label: string;
  type: string;
}

export interface PortalLuigiNodeExtensions {
  entityType?: string;
  requiredPolicies?: string[];
}

export interface LuigiNodeCategory {
  label: string;
  collapsible?: boolean;
  order?: number;
  id?: string;
  icon?: string;
}

export interface LuigiNodeContext extends Record<string, any> {
  serviceProviderConfig?: any;
}

export interface LuigiNode extends PortalLuigiNodeExtensions {
  pathSegment?: string;
  label?: string;
  category?: LuigiNodeCategory | string;
  context?: LuigiNodeContext;
  statusBadge?: LuigiStatusBadge;
}

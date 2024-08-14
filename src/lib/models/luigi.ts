export interface EntityDefinition {
  id: string;
  dynamicFetchId?: string;
  contextKey?: string;
  useBack?: boolean;
  label?: string;
  pluralLabel?: string;
  notFoundConfig?: Record<string, string>;
}

export interface LuigiStatusBadge {
  label: string;
  type: string;
}

export interface LuigiNodeIFramePermissions {
  allow?: string[];
  sandbox?: string[];
}

export interface PortalLuigiNodeExtensions {
  _preloadUrl?: string;
  _requiredIFramePermissionsForViewGroup?: LuigiNodeIFramePermissions;
  // internal navigation ordering
  _portalDirectChildren?: LuigiNode[];
  _intentMappings?: LuigiIntent[];
  _entityRelativePaths?: Record<string, any>;
  _entityRootChild?: boolean;
  entityType?: string;
  requiredPolicies?: string[];
  visibleForEntityContext?: Record<string, any>; // experimental/deprecated
  visibleForContext?: string; // experimental
  defineEntity?: EntityDefinition;
  globalNav?: boolean | string;
  order?: string;
  navSlot?: string;
  defineSlot?: string;
}

export interface LuigiNodeCategory {
  label: string;
  collapsible?: boolean;
  order?: number;
  id?: string;
  icon?: string;
}

export interface HelpContext {
  displayName?: string;
  issueTracker?: {
    url: string;
  };
  feedbackTracker?: {
    url: string;
  };
  stackSearch?: {
    tags: string[];
  };
  documentation?: {
    url: string;
  };
}

export interface LuigiIntent {
  baseEntityId?: string;
  relativePath?: string;
  semanticObject: string;
  action: string;
  pathSegment?: string;
}

export interface LuigiNode extends PortalLuigiNodeExtensions {
  pathSegment?: string;
  viewUrl?: string;
  viewGroup?: string;
  label?: string;
  navHeader?: any;
  hideFromNav?: boolean;
  hideSideNav?: boolean;
  virtualTree?: boolean;
  initialRoute?: any;
  showBreadcrumbs?: boolean;
  loadingIndicator?: { enabled: boolean };
  compound?: any;
  category?: LuigiNodeCategory | string;
  context?: Record<string, any>;
  visibleForFeatureToggles?: string[];
  statusBadge?: LuigiStatusBadge;
  onNodeActivation?: (node: LuigiNode) => boolean;
  children?:
    | LuigiNode[]
    | { (context?: any): Promise<LuigiNode[]> }
    | { (context?: any): LuigiNode[] };
}

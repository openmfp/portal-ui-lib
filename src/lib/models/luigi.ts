export interface LuigiGlobalContext extends Record<string, any> {
  portalContext: any;
  userId: string;
  userEmail: string;
  token: string;
}

export interface LuigiNavigationConfig {
  nodes?: LuigiNode[];
  viewGroupSettings?: any;
  appSwitcher?: any;
  globalContext?: any;
  profile?: any;
  addNavHrefs?: boolean;
  contextSwitcher?: any;
  nodeAccessibilityResolver?: any;
  validWebcomponentUrls?: string;
  intentMapping?: any;
  nodeChangeHook?: any;
  breadcrumbs?: any;
}

export interface LuigiConfig {
  auth?: any;
  routing?: any;
  settings?: any;
  lifecycleHooks?: any;
  navigation?: LuigiNavigationConfig;
  userSettings?: any;
  communication?: any;
  globalSearch?: any;
}

export interface LuigiCustomMessage {
  id: string;
}

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

export interface LuigiUserSetting {
  type: string;
  label?: string;
  style?: string;
  description?: string;
  options?: string[];
  isEditable?: boolean;
}

export interface LuigiUserSettingsGroup {
  label?: string;
  sublabel?: string;
  title?: string;
  icon?: string;
  viewUrl?: string;
  settings?: Record<string, LuigiUserSetting>;
}

export interface LuigiUserSettings {
  groups: Record<string, LuigiUserSettingsGroup>;
}

export interface LuigiNodeIFramePermissions {
  allow?: string[];
  sandbox?: string[];
}

export interface PortalLuigiNodeExtensions {
  _userSettingsConfig?: LuigiUserSettings;
  _preloadUrl?: string;
  _requiredIFramePermissionsForViewGroup?: LuigiNodeIFramePermissions;
  // internal navigation ordering
  _portalDirectChildren?: LuigiNode[];
  _intentMappings?: LuigiIntent[];
  _entityRelativePaths?: Record<string, any>;
  _entityRootChild?: boolean;
  hideFromBreadcrumb?: boolean;
  breadcrumbBadge?: BreadcrumbBadge;
  entityType?: string;
  requiredPolicies?: string[];
  visibleForEntityContext?: Record<string, any>; // experimental/deprecated
  visibleForContext?: string; // experimental
  visibleForPlugin?: boolean; // experimental
  configurationMissing?: string; // experimental
  networkVisibility?: NetworkVisibility; //experimental
  isMissingMandatoryData?: boolean; // experimental
  defineEntity?: EntityDefinition;
  globalNav?: boolean | string;
  order?: string;
  dxpOrder?: string;
  navSlot?: string;
  defineSlot?: string;
  configurationHint?: string; // experimental
  configurationLink?: string; // experimental
  requiredIFramePermissions?: LuigiNodeIFramePermissions;
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

export interface LuigiBadgeCounter {
  label: string;
  count: () => Promise<number | string> | number | string;
}

export interface LuigiNode extends PortalLuigiNodeExtensions {
  testId?: string;
  pathSegment?: string;
  viewUrl?: string;
  viewGroup?: string;
  label?: string;
  icon?: string;
  link?: string;
  urlSuffix?: string;
  navHeader?: any;
  hideFromNav?: boolean;
  hideSideNav?: boolean;
  virtualTree?: boolean;
  isolateView?: boolean;
  initialRoute?: any;
  openNodeInModal?: any;
  navigationContext?: string;
  showBreadcrumbs?: boolean;
  loadingIndicator?: { enabled: boolean };
  target?: IntentSpecification;
  compound?: any;
  badgeCounter?: LuigiBadgeCounter;
  category?: LuigiNodeCategory | string;
  context?: Record<string, any>;
  visibleForFeatureToggles?: string[];
  statusBadge?: LuigiStatusBadge;
  onNodeActivation?: (node: LuigiNode) => boolean;
  children?:
    | LuigiNode[]
    | { (context?: any): Promise<LuigiNode[]> }
    | { (context?: any): LuigiNode[] };
  titleResolver?: any;
}

export interface IntentSpecification {
  type: string;
  inboundId: string;
  resolvedIntent?: LuigiIntent;
}

export enum NetworkVisibility {
  INTERNAL = 'internal',
  INTERNET = 'internet',
}

export interface BreadcrumbBadge {
  text: string;
  colorSchema?: BreadcrumbBadgeColorSchema;
  hint?: string;
}

export type BreadcrumbBadgeColorSchema =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10';

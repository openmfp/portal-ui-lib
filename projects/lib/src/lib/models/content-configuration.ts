import {
  BreadcrumbBadge,
  HelpContext,
  LuigiNode,
  LuigiNodeIFramePermissions,
  LuigiUserSettings,
} from './luigi';

export interface LuigiNodeDefaults {
  entityType?: string;
  isolateView?: boolean;
}

export interface Dictionary {
  locale: string;
  textDictionary: Record<string, string>;
}

export interface LuigiAppConfig {
  urlTemplateParams: Record<string, any>;
  navMode?: string;
  urlTemplateId?: string;
}

export interface ViewGroup {
  preloadSuffix?: string;
  requiredIFramePermissions?: LuigiNodeIFramePermissions;
}

export interface LuigiConfigData {
  viewGroup?: ViewGroup;
  nodeDefaults?: LuigiNodeDefaults;
  nodes: LuigiNode[];
  texts?: Dictionary[];
  targetAppConfig?: Record<string, any>;
  userSettings?: LuigiUserSettings;
}

export interface LuigiConfigFragment {
  data: LuigiConfigData;
}

export interface ContentConfiguration {
  name: string;
  creationTimestamp?: string;
  url?: string;
  luigiConfigFragment: LuigiConfigFragment;
}

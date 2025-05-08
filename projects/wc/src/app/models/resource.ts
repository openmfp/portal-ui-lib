import { Condition, ObjectMeta } from 'kubernetes-types/meta/v1';

export interface NodeContext {
  resourceDefinition: ResourceDefinition;
  token: string;
  resourceId?: string;
  portalContext?: PortalContext;
  parentNavigationContexts: string[];
}

export interface PortalContext {
  crdGatewayApiUrl: string;
}

export interface FieldDefinition {
  label?: string;
  property: string | string[];
  jsonPathExpression?: string;
  required?: boolean;
  values?: string[];
}

export interface ResourceStatus {
  conditions: Condition[];
}

export interface ResourceSpec extends Record<string, any> {
  type: string;
  description?: string;
  displayName?: string;
}

export interface Resource extends Record<string, any> {
  metadata: ObjectMeta;
  spec?: ResourceSpec;
  status?: ResourceStatus;
}

export interface ResourceDefinition {
  group: string;
  plural: string;
  singular: string;
  kind: string;
  scope?: KubernetesScope;
  namespace?: string;
  ui?: UIDefinition;
}

interface UiView {
  fields: FieldDefinition[];
}

export interface UIDefinition {
  logoUrl?: string;
  listView?: UiView;
  createView?: UiView;
  detailView?: UiView;
}

export type KubernetesScope = 'Cluster' | 'Namespaced';

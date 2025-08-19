import { Condition, ObjectMeta } from 'kubernetes-types/meta/v1';


export interface FieldDefinition {
  label?: string;
  property: string | string[];
  jsonPathExpression?: string;
  required?: boolean;
  values?: string[];
  dynamicValuesDefinition?: {
    operation: string
    gqlQuery: string;
    value: string;
    key: string;
  };
}

export interface ResourceStatus {
  conditions: Condition[];
}

export interface ResourceSpec extends Record<string, any> {
  type: string;
  description?: string;
  displayName?: string;
}

export interface AccountInfo {
  metadata: ObjectMeta;
  spec: { clusterInfo: { ca: string } };
}

export interface Resource extends Record<string, any> {
  metadata: ObjectMeta;
  spec?: ResourceSpec;
  status?: ResourceStatus;
  __typename?: string;
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

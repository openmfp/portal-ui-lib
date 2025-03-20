export interface NodeContext {
  resourceDefinition: ResourceDefinition;
}

export interface ColumnDefinition {
  label: string;
  property: string;
}

export interface FieldDefinition {
  label: string;
  property: string;
  required?: boolean;
  value?: any;
}

export interface ResourceMetadata extends Record<string, any> {
  name: string;
}

export interface Resource extends Record<string, any> {
  metadata: ResourceMetadata;
}

export interface ResourceDefinition {
  group: string;
  plural: string;
  kind: string;
  scope?: KubernetesScope;
  namespace?: string;
  ui?: UIDefinition;
}

interface ListView {
  columns: ColumnDefinition[];
}

interface CreateView {
  fields: FieldDefinition[];
}

export interface UIDefinition {
  logoUrl?: string;
  listView: ListView;
  createView: CreateView;
}

export type KubernetesScope = 'Cluster' | 'Namespaced';

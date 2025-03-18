export interface ColumnDefinition {
  property: string;
  label: string;
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
  scope: KubernetesScope;
  namespace: string;
}

export interface UIDefinition {
  logoUrl: string;
  columns: ColumnDefinition[];
}

export type KubernetesScope = 'Cluster' | 'Namespaced';

import { LuigiNode } from './luigi';

export interface ValidationMessage {
  message: string;
}

export interface ValidationResult {
  parsedConfiguration?: string;
  validationErrors?: ValidationMessage[];
  url?: string;
}

export interface TransformResult {
  nodes?: LuigiNode[];
  errors?: ValidationResult[];
}

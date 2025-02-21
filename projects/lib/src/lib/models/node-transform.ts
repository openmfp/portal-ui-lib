import { LuigiNode } from './luigi';

export interface ValidationError {
  message: string;
}

export interface ValidationResult {
  parsedConfiguration?: string;
  validationErrors?: ValidationError[];
  url: string;
}

export interface TransformResult {
  nodes?: LuigiNode[];
  errors?: ValidationResult[];
}

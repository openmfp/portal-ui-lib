import { EntityDefinition, LuigiNode } from './luigi';

export interface ErrorComponentConfig {
  handleEntityRetrievalError?: (
    entityDefinition: EntityDefinition,
    errorCode: number,
    additionalContext?: Record<string, string>,
  ) => LuigiNode[];
}

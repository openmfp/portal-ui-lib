import { FieldDefinition, Resource } from '../models/resource';
import jsonpath from 'jsonpath';

export const getResourceValueByJsonPath = (
  resource: Resource,
  field: FieldDefinition,
) => {
  if (!field?.property) {
    return undefined;
  }

  const value = jsonpath.query(resource || {}, `$.${field.property}`);
  return value.length ? value[0] : undefined;
};

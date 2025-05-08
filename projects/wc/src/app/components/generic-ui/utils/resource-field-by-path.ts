import { FieldDefinition, Resource } from '../../../models/resource';
import jsonpath from 'jsonpath';

export const getResourceValueByJsonPath = (
  resource: Resource,
  field: FieldDefinition,
) => {
  const property = field?.jsonPathExpression || field?.property;
  if (!property) {
    return undefined;
  }

  if (property instanceof Array) {
    console.error(
      `Property defined as an array: ${JSON.stringify(property)}, provide "jsonPathExpression" field to properly ready resource value`,
    );
    return undefined;
  }

  const value = jsonpath.query(resource || {}, `$.${property}`);
  return value.length ? value[0] : undefined;
};

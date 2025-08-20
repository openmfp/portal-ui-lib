import { Resource, getResourceValueByJsonPath } from '@openmfp/portal-ui-lib';

export const getValueByPath = <T extends object, R = unknown>(
  obj: T,
  path: string,
): R | undefined => {
  return getResourceValueByJsonPath(obj as Resource, {
    jsonPathExpression: path,
    property: '',
  });
};

import { FieldDefinition, Resource } from '../models/resource';
import { getResourceValueByJsonPath } from './resource-field-by-path';

describe('getResourceValueByJsonPath', () => {
  it('should return the correct value for a valid JSON path', () => {
    const resource: Resource = {
      metadata: { name: 'test-resource', namespace: 'default' },
      spec: { type: 'example', description: 'A sample resource' },
    };
    const field: FieldDefinition = { property: 'spec.type' };
    expect(getResourceValueByJsonPath(resource, field)).toBe('example');
  });

  it('should return undefined if the property does not exist', () => {
    const resource: Resource = {
      metadata: { name: 'test-resource', namespace: 'default' },
    };
    const field: FieldDefinition = { property: 'spec.nonExistentField' };
    expect(getResourceValueByJsonPath(resource, field)).toBeUndefined();
  });

  it('should return undefined if the resource is undefined', () => {
    const field: FieldDefinition = { property: 'spec.type' };
    expect(getResourceValueByJsonPath(undefined as any, field)).toBeUndefined();
  });

  it('should return undefined if the field property is an empty string', () => {
    const resource: Resource = {
      metadata: { name: 'test-resource', namespace: 'default' },
    };
    const field: FieldDefinition = { property: '' };
    expect(getResourceValueByJsonPath(resource, field)).toBeUndefined();
  });

  it('should return the first matched value if multiple values exist', () => {
    const resource: Resource = {
      metadata: { name: 'test-resource', namespace: 'default' },
      status: {
        conditions: [
          { type: 'Ready', status: 'True' },
          { type: 'Degraded', status: 'False' },
        ],
      },
    } as Resource;
    const field: FieldDefinition = { property: 'status.conditions[0].status' };
    expect(getResourceValueByJsonPath(resource, field)).toBe('True');
  });

  it('should return the matched value for type Ready', () => {
    const resource: Resource = {
      metadata: { name: 'test-resource', namespace: 'default' },
      status: {
        conditions: [
          { type: 'Ready', status: 'False' },
          { type: 'Degraded', status: 'False' },
        ],
      },
    } as Resource;
    const field: FieldDefinition = {
      property: 'status.conditions[?(@.type=="Ready")].status',
    };
    expect(getResourceValueByJsonPath(resource, field)).toBe('False');
  });
});

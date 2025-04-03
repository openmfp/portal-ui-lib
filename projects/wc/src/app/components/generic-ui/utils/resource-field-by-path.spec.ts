import { FieldDefinition, Resource } from '../models/resource';
import { getResourceValueByJsonPath } from './resource-field-by-path';

describe('getResourceValueByJsonPath', () => {
  it('should return undefined when field is undefined', () => {
    const resource = {} as Resource;
    const result = getResourceValueByJsonPath(
      resource,
      undefined as unknown as FieldDefinition,
    );
    expect(result).toBeUndefined();
  });

  it('should return undefined when property is not defined', () => {
    const resource = {} as Resource;
    const field = {} as FieldDefinition;
    const result = getResourceValueByJsonPath(resource, field);
    expect(result).toBeUndefined();
  });

  it('should return undefined when property is an array', () => {
    const resource = {} as Resource;
    const field = { property: ['prop1', 'prop2'] } as FieldDefinition;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = getResourceValueByJsonPath(resource, field);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Property defined as an array: ["prop1","prop2"], provide "jsonPathExpression" field to properly ready resource value',
    );
    consoleSpy.mockRestore();
  });

  it('should use jsonPathExpression if provided', () => {
    const resource = { metadata: { name: 'test' } } as Resource;
    const field = {
      property: 'not-used',
      jsonPathExpression: 'metadata.name',
    } as FieldDefinition;

    const result = getResourceValueByJsonPath(resource, field);
    expect(result).toBe('test');
  });

  it('should use property if jsonPathExpression is not provided', () => {
    const resource = { metadata: { name: 'test' } } as Resource;
    const field = { property: 'metadata.name' } as FieldDefinition;

    const result = getResourceValueByJsonPath(resource, field);
    expect(result).toBe('test');
  });

  it('should return undefined when jsonpath query returns empty array', () => {
    const resource = { metadata: { name: 'test' } } as Resource;
    const field = { property: 'metadata.nonexistent' } as FieldDefinition;

    const result = getResourceValueByJsonPath(resource, field);
    expect(result).toBeUndefined();
  });

  it('should return the first value when jsonpath query returns multiple values', () => {
    const resource = {
      items: [{ name: 'item1' }, { name: 'item2' }],
    } as unknown as Resource;
    const field = { property: 'items[*].name' } as FieldDefinition;

    const result = getResourceValueByJsonPath(resource, field);
    expect(result).toBe('item1');
  });

  it('should handle null resource input', () => {
    const field = { property: 'metadata.name' } as FieldDefinition;

    const result = getResourceValueByJsonPath(
      null as unknown as Resource,
      field,
    );
    expect(result).toBeUndefined();
  });

  it('should handle undefined resource input', () => {
    const field = { property: 'metadata.name' } as FieldDefinition;

    const result = getResourceValueByJsonPath(
      undefined as unknown as Resource,
      field,
    );
    expect(result).toBeUndefined();
  });

  it('should handle complex nested paths', () => {
    const resource = {
      spec: {
        template: {
          spec: {
            containers: [
              { name: 'container1', image: 'image1' },
              { name: 'container2', image: 'image2' },
            ],
          },
        },
      },
    } as unknown as Resource;

    const field = {
      property: 'spec.template.spec.containers[0].image',
    } as FieldDefinition;

    const result = getResourceValueByJsonPath(resource, field);
    expect(result).toBe('image1');
  });
});

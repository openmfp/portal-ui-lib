import { FieldDefinition } from '../models/resource';
import { generateGraphQLFields } from './columns-to-gql-fields';

describe('generateGraphQLFields', () => {
  it('should handle empty array input', () => {
    const result = generateGraphQLFields([]);
    expect(result).toEqual([]);
  });

  it('should handle single property fields', () => {
    const fields: FieldDefinition[] = [
      { property: 'name', label: 'Name' },
      { property: 'status', label: 'Status' },
    ];

    const result = generateGraphQLFields(fields);
    expect(result).toEqual(['name', 'status']);
  });

  it('should handle nested property fields', () => {
    const fields: FieldDefinition[] = [
      { property: 'metadata.name', label: 'Name' },
    ];

    const result = generateGraphQLFields(fields);
    expect(result).toEqual([{ metadata: ['name'] }]);
  });

  it('should handle array of properties', () => {
    const fields: FieldDefinition[] = [
      { property: ['name', 'status'], label: 'Basic Info' },
    ];

    const result = generateGraphQLFields(fields);
    expect(result).toEqual(['name', 'status']);
  });

  it('should handle array of properties with nested paths', () => {
    const fields: FieldDefinition[] = [
      { property: ['metadata.name', 'spec.type'], label: 'Resource Info' },
    ];

    const result = generateGraphQLFields(fields);
    // The current implementation would produce this structure
    expect(result).toEqual([{ metadata: ['name'] }, { spec: ['type'] }]);
  });

  it('should handle complex mixed field definitions', () => {
    const fields: FieldDefinition[] = [
      { property: 'id', label: 'ID' },
      { property: 'metadata.name', label: 'Name' },
      { property: ['status.phase', 'spec.replicas'], label: 'Details' },
    ];

    const result = generateGraphQLFields(fields);
    expect(result).toEqual([
      'id',
      { metadata: ['name'] },
      { status: ['phase'] },
      { spec: ['replicas'] },
    ]);
  });

  it('should handle empty property strings', () => {
    const fields: FieldDefinition[] = [{ property: '', label: 'Empty' }];

    const result = generateGraphQLFields(fields);
    expect(result).toEqual([]);
  });

  it('should handle deeply nested properties', () => {
    const fields: FieldDefinition[] = [
      { property: 'metadata.annotations.description', label: 'Description' },
    ];

    const result = generateGraphQLFields(fields);
    expect(result).toEqual([
      {
        metadata: [
          {
            annotations: ['description'],
          },
        ],
      },
    ]);
  });
});

import { generateFields } from './columns-to-gql-fields';

describe('generateFields', () => {
  it('should generate fields from an array of column definitions', () => {
    const columns = [
      { property: 'metadata.name', label: 'Name' },
      {
        property: 'status.conditions[?(@.type=="Ready")].status',
        label: 'Ready',
      },
    ];

    const result = generateFields(columns);

    expect(result).toEqual([
      { metadata: ['name'] },
      { status: [{ conditions: ['status'] }] },
    ]);
  });

  it('should handle empty columns array', () => {
    const result = generateFields([]);
    expect(result).toEqual([]);
  });

  it('should handle multiple nested properties', () => {
    const columns = [
      { property: 'metadata.name', label: 'Name' },
      { property: 'spec.displayName', label: 'Display Name' },
      { property: 'spec.type', label: 'Type' },
    ];

    const result = generateFields(columns);

    expect(result).toEqual([
      { metadata: ['name'] },
      { spec: ['displayName'] },
      { spec: ['type'] },
    ]);
  });

  it('should handle columns with empty property values', () => {
    const columns = [
      { property: '', label: 'Empty' },
      { property: 'metadata.name', label: 'Name' },
    ];

    const result = generateFields(columns);

    expect(result).toEqual([{ metadata: ['name'] }]);
  });

  it('should handle deep nesting with multiple levels', () => {
    const columns = [{ property: 'level1.level2.level3.value', label: 'Deep' }];

    const result = generateFields(columns);

    expect(result).toEqual([{ level1: [{ level2: [{ level3: ['value'] }] }] }]);
  });

  it('should remove JSONPath filter expressions', () => {
    const columns = [
      { property: 'items[?(@.name=="test")].value', label: 'Filtered' },
    ];

    const result = generateFields(columns);

    expect(result).toEqual([{ items: ['value'] }]);
  });

  it('should handle array index notation', () => {
    const columns = [{ property: 'items[0].name', label: 'Indexed' }];

    const result = generateFields(columns);

    expect(result).toEqual([{ items: ['name'] }]);
  });

  it('should handle complex mixed paths with array indices and filters', () => {
    const columns = [
      {
        property:
          'spec.template.spec.containers[0].resources.requests[?(@.name=="cpu")].value',
        label: 'Complex',
      },
    ];

    const result = generateFields(columns);

    expect(result).toEqual([
      {
        spec: [
          {
            template: [
              {
                spec: [
                  { containers: [{ resources: [{ requests: ['value'] }] }] },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('should handle undefined column properties', () => {
    const columns = [
      { label: 'Missing Property' },
      { property: 'metadata.name', label: 'Name' },
    ];

    const result = generateFields(columns);

    expect(result).toEqual([{ metadata: ['name'] }]);
  });
});

import { FieldDefinition } from '../../../models/resource';
import { generateGraphQLFields } from './columns-to-gql-fields';

describe('columns-to-gql-fields', () => {
  describe('generateGraphQLFields', () => {
    it('should handle empty array input', () => {
      const result = generateGraphQLFields([]);
      expect(result).toEqual([]);
    });

    it('should handle single field with simple property', () => {
      const fields: FieldDefinition[] = [{ property: 'name', label: 'Name' }];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual(['name']);
    });

    it('should handle multiple fields with simple properties', () => {
      const fields: FieldDefinition[] = [
        { property: 'name', label: 'Name' },
        { property: 'age', label: 'Age' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual(['name', 'age']);
    });

    it('should handle nested properties with dot notation', () => {
      const fields: FieldDefinition[] = [
        { property: 'user.name', label: 'User Name' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual([{ user: ['name'] }]);
    });

    it('should handle deeply nested properties', () => {
      const fields: FieldDefinition[] = [
        { property: 'user.profile.address.city', label: 'City' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual([
        { user: [{ profile: [{ address: ['city'] }] }] },
      ]);
    });

    it('should handle array of properties', () => {
      const fields: FieldDefinition[] = [
        { property: ['name', 'age'], label: 'User Info' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual(['name', 'age']);
    });

    it('should handle mixed array of simple and nested properties', () => {
      const fields: FieldDefinition[] = [
        { property: ['name', 'user.profile.age'], label: 'Mixed Info' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual(['name', { user: [{ profile: ['age'] }] }]);
    });

    it('should handle multiple fields with mixed properties', () => {
      const fields: FieldDefinition[] = [
        { property: 'name', label: 'Name' },
        { property: 'user.profile.age', label: 'Age' },
        { property: ['email', 'phone'], label: 'Contact' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual([
        'name',
        { user: [{ profile: ['age'] }] },
        'email',
        'phone',
      ]);
    });

    it('should handle empty or null property values', () => {
      const fields: FieldDefinition[] = [
        { property: '', label: 'Empty' },
        { property: null as any, label: 'Null' },
      ];
      const result = generateGraphQLFields(fields);
      expect(result).toEqual([]);
    });
  });
});

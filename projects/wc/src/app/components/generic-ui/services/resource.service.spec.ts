import { ApolloFactory } from '../../../services/apollo-factory';
import { Resource, ResourceDefinition } from '../models/resource';
import { ResourceService } from './resource.service';
import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import * as gqlBuilder from 'gql-query-builder';
import { of } from 'rxjs';

jest.mock('gql-query-builder', () => ({
  subscription: jest.fn().mockReturnValue({
    query: 'subscription { test_operation { field1 field2 } }',
  }),
}));

describe('ResourceService', () => {
  let service: ResourceService;
  let mockApollo: jest.Mocked<Apollo>;
  let mockApolloFactory: { apollo: jest.Mocked<Apollo> };

  beforeEach(() => {
    mockApollo = {
      subscribe: jest.fn(),
      mutate: jest.fn(),
    } as unknown as jest.Mocked<Apollo>;

    mockApolloFactory = {
      apollo: mockApollo,
    };

    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        { provide: ApolloFactory, useValue: mockApolloFactory },
      ],
    });

    service = TestBed.inject(ResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('read', () => {
    it('should call Apollo subscribe with correct query', () => {
      const mockOperation = 'test_operation';
      const mockFields = ['field1', 'field2'];
      mockApollo.subscribe.mockReturnValue(
        of({ data: { test_operation: [] } }),
      );

      service.read(mockOperation, mockFields);

      expect(gqlBuilder.subscription).toHaveBeenCalledWith({
        operation: mockOperation,
        fields: mockFields,
        variables: {},
      });

      expect(mockApollo.subscribe).toHaveBeenCalledWith({
        query: jasmine.anything(),
      });
    });
  });

  describe('delete', () => {
    it('should call Apollo mutate with cluster-scoped mutation when scope is Cluster', () => {
      const mockResource: Resource = {
        metadata: { name: 'test-resource' },
      };

      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Cluster',
      };

      mockApollo.mutate.mockReturnValue(of({ data: null }));

      service.delete(mockResource, mockResourceDefinition);

      expect(mockApollo.mutate).toHaveBeenCalledWith({
        mutation: jasmine.anything(),
        variables: {
          name: 'test-resource',
          namespace: undefined,
        },
      });
    });

    it('should call Apollo mutate with namespaced mutation when scope is Namespaced', () => {
      const mockResource: Resource = {
        metadata: { name: 'test-resource' },
      };

      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Namespaced',
        namespace: 'test-namespace',
      };

      mockApollo.mutate.mockReturnValue(of({ data: null }));

      service.delete(mockResource, mockResourceDefinition);

      expect(mockApollo.mutate).toHaveBeenCalledWith({
        mutation: jasmine.anything(),
        variables: {
          name: 'test-resource',
          namespace: 'test-namespace',
        },
      });
    });
  });

  describe('createDeleteQueryMutation', () => {
    it('should create cluster-scoped delete mutation', () => {
      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Cluster',
      };

      const result = (service as any).createDeleteQueryMutation(
        mockResourceDefinition,
      );

      expect(result).toContain('mutation ($name: String!)');
      expect(result).toContain('test_group');
      expect(result).toContain('deleteTestResource(name: $name)');
      expect(result).not.toContain('namespace: $namespace');
    });

    it('should create namespaced delete mutation', () => {
      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Namespaced',
      };

      const result = (service as any).createDeleteQueryMutation(
        mockResourceDefinition,
      );

      expect(result).toContain('mutation ($name: String!, $namespace: String)');
      expect(result).toContain('test_group');
      expect(result).toContain(
        'deleteTestResource(name: $name, namespace: $namespace)',
      );
    });

    it('should handle group names with dots correctly', () => {
      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.complex.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Namespaced',
      };

      const result = (service as any).createDeleteQueryMutation(
        mockResourceDefinition,
      );

      expect(result).toContain('test_complex_group');
    });
  });
});

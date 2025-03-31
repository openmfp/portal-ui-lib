import { ApolloFactory } from '../../../services/apollo-factory';
import { Resource, ResourceDefinition } from '../models/resource';
import { ResourceService } from './resource.service';
import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import * as gqlBuilder from 'gql-query-builder';
import { of } from 'rxjs';

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

    // Reset Apollo mocks before each test
    jest.clearAllMocks();
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

      service.list(mockOperation, mockFields);

      // Get the actual query that would be generated by gqlBuilder
      const expectedQueryObj = gqlBuilder.subscription({
        operation: mockOperation,
        fields: mockFields,
        variables: {},
      });

      // Verify Apollo was called with a query containing the expected query string
      expect(mockApollo.subscribe).toHaveBeenCalledWith({
        query: expect.anything(),
      });

      // Extract the query string from the call arguments
      const callArgs = mockApollo.subscribe.mock.calls[0][0];
      expect(callArgs.query.loc.source.body).toContain(mockOperation);
      expect(callArgs.query.loc.source.body).toContain('subscription');
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

      // Check that Apollo mutate was called
      expect(mockApollo.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          name: 'test-resource',
          namespace: undefined,
        },
      });

      // Extract the query string from the call arguments
      const callArgs = mockApollo.mutate.mock.calls[0][0];
      const queryString = callArgs.mutation.loc.source.body;

      // Verify query structure without depending on exact formatting
      expect(queryString).toContain('mutation');
      expect(queryString).toContain('test_group');
      expect(queryString).toContain('deleteTestResource');
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

      // Check that Apollo mutate was called
      expect(mockApollo.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          name: 'test-resource',
          namespace: 'test-namespace',
        },
      });

      // Extract the query string from the call arguments
      const callArgs = mockApollo.mutate.mock.calls[0][0];
      const queryString = callArgs.mutation.loc.source.body;

      // Verify query structure without depending on exact formatting
      expect(queryString).toContain('mutation');
      expect(queryString).toContain('test_group');
      expect(queryString).toContain('deleteTestResource');
      // Should include namespace in the variables
      expect(queryString).toMatch(/name:.+namespace/s);
    });

    it('should handle group names with dots correctly', () => {
      const mockResource: Resource = {
        metadata: { name: 'test-resource' },
      };

      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.complex.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Cluster',
      };

      mockApollo.mutate.mockReturnValue(of({ data: null }));

      service.delete(mockResource, mockResourceDefinition);

      // Extract the query string from the call arguments
      const callArgs = mockApollo.mutate.mock.calls[0][0];
      const queryString = callArgs.mutation.loc.source.body;

      // Verify the group name was correctly transformed
      expect(queryString).toContain('test_complex_group');
      expect(queryString).not.toContain('test.complex.group');
    });
  });

  describe('create', () => {
    it('should call Apollo mutate with correct input', () => {
      const mockResource: Resource = {
        metadata: {
          name: 'test-resource',
          description: 'Test description',
        },
        spec: {
          displayName: 'Test Display Name',
          type: 'account',
        },
      };

      const mockResourceDefinition: ResourceDefinition = {
        group: 'core.openmfp.org',
        plural: 'accounts',
        kind: 'Account',
        scope: 'Cluster',
      };

      mockApollo.mutate.mockReturnValue(of({ data: null }));

      service.create(mockResource, mockResourceDefinition);

      expect(mockApollo.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        fetchPolicy: 'no-cache',
        variables: { object: mockResource },
      });

      // Extract the query string from the call arguments
      const callArgs = mockApollo.mutate.mock.calls[0][0];
      const queryString = callArgs.mutation.loc.source.body;

      // Verify query structure without depending on exact formatting
      expect(queryString).toContain('mutation');
      expect(queryString).toContain('core_openmfp_org');
      expect(queryString).toContain('createAccount');
      expect(queryString).toContain('__typename');
    });

    it('should handle group names with dots correctly for create operation', () => {
      const mockResource: Resource = {
        metadata: { name: 'test-resource' },
        spec: {},
      };

      const mockResourceDefinition: ResourceDefinition = {
        group: 'test.complex.group',
        plural: 'resources',
        kind: 'TestResource',
        scope: 'Cluster',
      };

      mockApollo.mutate.mockReturnValue(of({ data: null }));

      service.create(mockResource, mockResourceDefinition);

      // Extract the query string from the call arguments
      const callArgs = mockApollo.mutate.mock.calls[0][0];
      const queryString = callArgs.mutation.loc.source.body;

      // Verify the group name was correctly transformed
      expect(queryString).toContain('test_complex_group');
      expect(queryString).not.toContain('test.complex.group');
    });
  });
});

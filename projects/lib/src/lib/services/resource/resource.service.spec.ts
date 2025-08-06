import { LuigiCoreService } from '../luigi-core.service';
import { ApolloFactory } from './apollo-factory';
import { ResourceService } from './resource.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

describe('ResourceService', () => {
  let service: ResourceService;
  let mockApollo: any;
  let mockApolloFactory: any;
  let mockLuigiCoreService: jest.Mocked<LuigiCoreService>;

  const nodeContext: any = { cluster: 'test' };
  const resource: any = { metadata: { name: 'test-name' } };
  const resourceDefinition: any = {
    group: 'core.k8s.io',
    kind: 'TestKind',
    scope: 'Namespaced',
    namespace: 'default',
  };

  beforeEach(() => {
    mockLuigiCoreService = mock();
    mockApollo = {
      query: jest.fn(),
      subscribe: jest.fn(),
      mutate: jest.fn(),
    };

    mockApolloFactory = {
      apollo: jest.fn().mockReturnValue(mockApollo),
    };

    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        { provide: ApolloFactory, useValue: mockApolloFactory },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      ],
    });

    service = TestBed.inject(ResourceService);
  });

  describe('read', () => {
    it('should catch gql parsing error and return null observable', (done) => {
      const invalidQuery =
        `query { core_k8s_io { TestKind(name: "test-name") {` as unknown as any;

      const mockShowAlert = jest.fn();
      service['luigiCoreService'].showAlert = mockShowAlert;

      service
        .read('test-name', 'core_k8s_io', 'TestKind', invalidQuery, nodeContext)
        .subscribe((res) => {
          expect(res).toBeNull();
          expect(mockLuigiCoreService.showAlert).toHaveBeenCalledWith({
            text: expect.any(String),
            type: 'error',
          });
          done();
        });
    });

    it('should read resource using fields', (done) => {
      mockApollo.query.mockReturnValue(
        of({ data: { core_k8s_io: { TestKind: { name: 'test' } } } }),
      );

      service
        .read('test-name', 'core_k8s_io', 'TestKind', ['name'], nodeContext)
        .subscribe((res) => {
          expect(res).toEqual({ name: 'test' });
          expect(mockApollo.query).toHaveBeenCalledWith({
            query: expect.anything(),
            variables: {
              name: 'test-name',
            },
          });
          done();
        });
    });

    it('should read resource using fields with namespace', (done) => {
      mockApollo.query.mockReturnValue(
        of({ data: { core_k8s_io: { TestKind: { name: 'test' } } } }),
      );
      const namespace = 'test-namespace';

      service
        .read('test-name', 'core_k8s_io', 'TestKind', ['name'], nodeContext, namespace)
        .subscribe((res) => {
          expect(res).toEqual({ name: 'test' });
          expect(mockApollo.query).toHaveBeenCalledWith({
            query: expect.anything(),
            variables: {
              name: 'test-name',
              namespace: namespace,
            },
          });
          done();
        });
    });

    it('should read resource using raw query', (done) => {
      const rawQuery = `query { core_k8s_io { TestKind(name: "test-name") { name } } }`;
      mockApollo.query.mockReturnValue(
        of({ data: { core_k8s_io: { TestKind: { name: 'test' } } } }),
      );

      service
        .read('test-name', 'core_k8s_io', 'TestKind', rawQuery, nodeContext)
        .subscribe((res) => {
          expect(res).toEqual({ name: 'test' });
          expect(mockApollo.query).toHaveBeenCalledWith({
            query: expect.anything(),
            variables: {
              name: 'test-name',
            },
          });
          done();
        });
    });

    it('should read resource using raw query with namespace', (done) => {
      const rawQuery = `query { core_k8s_io { TestKind(name: "test-name", namespace: "test-namespace") { name } } }`;
      mockApollo.query.mockReturnValue(
        of({ data: { core_k8s_io: { TestKind: { name: 'test' } } } }),
      );
      const namespace = 'test-namespace';

      service
        .read('test-name', 'core_k8s_io', 'TestKind', rawQuery, nodeContext, namespace)
        .subscribe((res) => {
          expect(res).toEqual({ name: 'test' });
          expect(mockApollo.query).toHaveBeenCalledWith({
            query: expect.anything(),
            variables: {
              name: 'test-name',
              namespace: namespace,
            },
          });
          done();
        });
    });

    it('should handle read error', (done) => {
      const error = new Error('fail');
      mockApollo.query.mockReturnValue(throwError(() => error));
      console.error = jest.fn();

      service
        .read('test-name', 'core_k8s_io', 'TestKind', ['name'], nodeContext)
        .subscribe({
          error: (err) => {
            expect(console.error).toHaveBeenCalledWith(
              'Error executing GraphQL query.',
              error,
            );
            done();
          },
        });
    });
  });

  describe('list', () => {
    it('should list resources', (done) => {
      mockApollo.subscribe.mockReturnValue(
        of({ data: { myList: [{ name: 'res1' }] } }),
      );
      service.list('myList', ['name'], nodeContext).subscribe((res) => {
        expect(res).toEqual([{ name: 'res1' }]);
        expect(mockApollo.subscribe).toHaveBeenCalledWith({
          query: expect.anything(),
          variables: {},
        });
        done();
      });
    });

    it('should list resources with namespace', (done) => {
      mockApollo.subscribe.mockReturnValue(
        of({ data: { myList: [{ name: 'res1' }] } }),
      );
      const namespace = 'test-namespace';

      service.list('myList', ['name'], nodeContext, namespace).subscribe((res) => {
        expect(res).toEqual([{ name: 'res1' }]);
        expect(mockApollo.subscribe).toHaveBeenCalledWith({
          query: expect.anything(),
          variables: { namespace: namespace },
        });
        done();
      });
    });

    it('should handle list error', (done) => {
      const error = new Error('fail');
      mockApollo.subscribe.mockReturnValue(throwError(() => error));
      console.error = jest.fn();

      service.list('myList', ['name'], nodeContext).subscribe({
        error: (err) => {
          expect(console.error).toHaveBeenCalledWith(
            'Error executing GraphQL query.',
            error,
          );
          done();
        },
      });
    });
  });

  describe('readOrganizations', () => {
    it('should read organizations', (done) => {
      mockApollo.query.mockReturnValue(of({ data: { orgList: [{ id: 1 }] } }));
      service
        .readOrganizations('orgList', ['id'], nodeContext)
        .subscribe((res) => {
          expect(res).toEqual([{ id: 1 }]);
          done();
        });
    });

    it('should handle read organizations error', (done) => {
      const error = new Error('fail');
      mockApollo.query.mockReturnValue(throwError(() => error));
      console.error = jest.fn();

      service.readOrganizations('orgList', ['id'], nodeContext).subscribe({
        error: (err) => {
          expect(console.error).toHaveBeenCalledWith(
            'Error executing GraphQL query.',
            error,
          );
          done();
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete resource', (done) => {
      mockApollo.mutate.mockReturnValue(of({}));
      service
        .delete(resource, resourceDefinition, nodeContext)
        .subscribe((res) => {
          expect(mockApollo.mutate).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('create', () => {
    it('should create resource', (done) => {
      mockApollo.mutate.mockReturnValue(
        of({ data: { __typename: 'TestKind' } }),
      );
      service
        .create(resource, resourceDefinition, nodeContext)
        .subscribe((res) => {
          expect(mockApollo.mutate).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('readKcpCA', () => {
    it('should read KCP CA', (done) => {
      const ca = 'cert-data';
      mockApollo.query.mockReturnValue(
        of({
          data: {
            core_platform_mesh_io: {
              AccountInfo: { spec: { clusterInfo: { ca } } },
            },
          },
        }),
      );
      service.readKcpCA(nodeContext).subscribe((res) => {
        expect(res).toBe(btoa(ca));
        expect(mockApolloFactory.apollo).toHaveBeenCalledWith(nodeContext);
        done();
      });
    });
  });
});

import { LuigiGlobalContext } from '../../models';
import { Resource } from '../../models/resource';
import { LuigiCoreService } from '../luigi-core.service';
import { ResourceService } from '../resource';
import { NodeContextProcessingService } from './node-context-processing.service';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

describe('NodeContextProcessingService', () => {
  let service: NodeContextProcessingService;
  let mockResourceService: jest.Mocked<ResourceService>;
  let mockLuigiCoreService: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    mockResourceService = {
      read: jest.fn(),
    } as unknown as jest.Mocked<ResourceService>;

    mockLuigiCoreService = {
      getGlobalContext: jest.fn(),
    } as unknown as jest.Mocked<LuigiCoreService>;

    TestBed.configureTestingModule({
      providers: [
        NodeContextProcessingService,
        { provide: ResourceService, useValue: mockResourceService },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      ],
    });

    service = TestBed.inject(NodeContextProcessingService);
  });

  it('should not call read if entityId or graphqlEntity fields are missing', () => {
    const ctx: any = {};
    const node: any = {
      defineEntity: {
        graphqlEntity: {
          group: '',
          kind: 'Kind',
          query: '{ id }',
        },
      },
      context: {},
    };

    service.readAndStoreEntityInNodeContext('', node, ctx);
    expect(mockResourceService.read).not.toHaveBeenCalled();

    service.readAndStoreEntityInNodeContext(
      'id',
      { defineEntity: {} } as any,
      ctx,
    );
    expect(mockResourceService.read).not.toHaveBeenCalled();
  });

  it('should call read and update entity in context', () => {
    const ctx: any = {};
    const node: any = {
      defineEntity: {
        graphqlEntity: {
          group: 'test.group',
          kind: 'EntityKind',
          query: '{ id name }',
        },
      },
      context: {},
    };

    const entity: Resource = {
      metadata: {
        name: 'entity-name',
        namespace: 'default',
        uid: 'uid-123',
      },
      spec: {
        type: '2',
      },
      status: {
        conditions: [],
      },
    };

    const globalContext: LuigiGlobalContext = {
      portalContext: {
        someValue: 'abc',
      },
      userId: 'user-123',
      userEmail: 'user@example.com',
      token: 'token123',
      organization: 'org-name',
    };

    mockResourceService.read.mockReturnValue(of(entity));
    mockLuigiCoreService.getGlobalContext.mockReturnValue(globalContext);

    service.readAndStoreEntityInNodeContext('1', node, ctx);

    expect(mockResourceService.read).toHaveBeenCalledWith(
      '1',
      'test_group',
      'EntityKind',
      'query ($name: String!) { test_group { EntityKind(name: $name) { id name } }}',
      globalContext,
    );
    expect(ctx.entity).toEqual(entity);
    expect(node.context.entity).toEqual(entity);
  });

  it('should handle read error and not update context', () => {
    const ctx: any = {};
    const node: any = {
      defineEntity: {
        graphqlEntity: {
          group: 'some.group',
          kind: 'SomeKind',
          query: '{ name }',
        },
      },
      context: {},
    };

    mockResourceService.read.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    mockLuigiCoreService.getGlobalContext.mockReturnValue({
      portalContext: {},
      userId: 'u',
      userEmail: 'e',
      token: 't',
      organization: 'o',
    });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    service.readAndStoreEntityInNodeContext('x', node, ctx);

    expect(mockResourceService.read).toHaveBeenCalled();
    expect(ctx.entity).toBeUndefined();
    expect(node.context.entity).toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      'Not able to read entity x from some_group',
    );

    errorSpy.mockRestore();
  });
});

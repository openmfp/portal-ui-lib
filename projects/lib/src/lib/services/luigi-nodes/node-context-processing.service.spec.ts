import { LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode, NodeContext } from '../../models';
import {
  NodeContextProcessingService,
  NodeContextProcessingServiceImpl,
} from './node-context-processing.service';
import { TestBed } from '@angular/core/testing';

describe('NodeContextProcessingServiceImpl', () => {
  let service: NodeContextProcessingServiceImpl;
  let customNodeContextProcessingService: jest.Mocked<NodeContextProcessingService> | null;

  beforeEach(() => {
    customNodeContextProcessingService = {
      processNodeContext: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NodeContextProcessingServiceImpl,
        {
          provide: LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN,
          useFactory: () => customNodeContextProcessingService,
        },
      ],
    });

    service = TestBed.inject(NodeContextProcessingServiceImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set entityType in node context from defineEntity id', async () => {
    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext('entity123', entityNode, ctx);

    expect(entityNode.context.entityType).toBe('testEntity');
  });

  it('should call custom node context processing service if provided', async () => {
    const entityId = 'entity123';
    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext(entityId, entityNode, ctx);

    expect(
      customNodeContextProcessingService!.processNodeContext,
    ).toHaveBeenCalledWith(entityId, entityNode, ctx);
  });

  it('should execute default processing before custom processing', async () => {
    customNodeContextProcessingService!.processNodeContext.mockImplementation(
      async () => {},
    );

    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext('entity123', entityNode, ctx);

    expect(entityNode.context.entityType).toBe('testEntity');
    expect(
      customNodeContextProcessingService!.processNodeContext,
    ).toHaveBeenCalled();
  });

  it('should handle undefined entityId', async () => {
    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext(undefined, entityNode, ctx);

    expect(entityNode.context.entityType).toBe('testEntity');
    expect(
      customNodeContextProcessingService!.processNodeContext,
    ).toHaveBeenCalledWith(undefined, entityNode, ctx);
  });

  it('should handle node without defineEntity', async () => {
    const entityNode: LuigiNode = {
      pathSegment: 'test',
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext('entity123', entityNode, ctx);

    expect(entityNode.context.entityType).toBeUndefined();
  });

  it('should preserve existing context properties', async () => {
    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {
        userId: 'user123',
        userEmail: 'test@example.com',
        token: 'token123',
        portalContext: {},
        portalBaseUrl: 'http://localhost',
      } as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext('entity123', entityNode, ctx);

    expect(entityNode.context.userId).toBe('user123');
    expect(entityNode.context.userEmail).toBe('test@example.com');
    expect(entityNode.context.token).toBe('token123');
    expect(entityNode.context.entityType).toBe('testEntity');
  });

  it('should handle node with defineEntity but without id', async () => {
    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {} as any,
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await service.processNodeContext('entity123', entityNode, ctx);

    expect(entityNode.context.entityType).toBeUndefined();
  });

  it('should propagate errors from custom processing service', async () => {
    const error = new Error('Custom processing failed');
    customNodeContextProcessingService!.processNodeContext.mockRejectedValue(
      error,
    );

    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    await expect(
      service.processNodeContext('entity123', entityNode, ctx),
    ).rejects.toThrow('Custom processing failed');
  });

  it('should still execute default processing before error is thrown', async () => {
    const error = new Error('Custom processing failed');
    customNodeContextProcessingService!.processNodeContext.mockRejectedValue(
      error,
    );

    const entityNode: LuigiNode = {
      pathSegment: 'test',
      defineEntity: {
        id: 'testEntity',
      },
      context: {} as NodeContext,
    };
    const ctx: NodeContext = {} as NodeContext;

    try {
      await service.processNodeContext('entity123', entityNode, ctx);
    } catch (e) {
      expect(entityNode.context.entityType).toBe('testEntity');
    }
  });

  describe('without custom node context processing service', () => {
    beforeEach(() => {
      customNodeContextProcessingService = null;
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [NodeContextProcessingServiceImpl],
      });

      service = TestBed.inject(NodeContextProcessingServiceImpl);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should work without custom service', async () => {
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
        context: {} as NodeContext,
      };
      const ctx: NodeContext = {} as NodeContext;

      await service.processNodeContext('entity123', entityNode, ctx);

      expect(entityNode.context.entityType).toBe('testEntity');
    });

    it('should not throw error when custom service is not provided', async () => {
      const entityNode: LuigiNode = {
        pathSegment: 'test',
        defineEntity: {
          id: 'testEntity',
        },
        context: {} as NodeContext,
      };
      const ctx: NodeContext = {} as NodeContext;

      await expect(
        service.processNodeContext('entity123', entityNode, ctx),
      ).resolves.not.toThrow();
    });
  });
});

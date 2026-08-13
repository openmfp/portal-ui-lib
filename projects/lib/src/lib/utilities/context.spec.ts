import { LuigiGlobalContext, LuigiNode, NodeContext } from '../models';
import { computeDynamicFetchContext, visibleForContext } from './context';

describe('visibleForContext', () => {
  it('should return false when entityContext does not match', () => {
    const ctx = { entityContext: { type: 'user' } };
    const node = {
      visibleForEntityContext: { type: 'admin' },
      context: {} as NodeContext,
    } as LuigiNode;

    const result = visibleForContext(ctx, node);
    expect(result).toBe(false);
  });

  it('should return true when all checks pass', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = {
      visibleForEntityContext: { type: 'admin' },
      visibleForContext: 'entityContext.type == `admin`',
    } as any as LuigiNode;

    const result = visibleForContext(ctx, node);

    expect(result).toBe(true);
  });

  it('should return false when JMESPath does not match', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = {
      visibleForEntityContext: { type: 'admin' },
      visibleForContext: 'someExpression',
    } as any as LuigiNode;

    const result = visibleForContext(ctx, node);

    expect(result).toBe(false);
  });

  it('should return true when visibleForEntityContext is empty object', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = { visibleForEntityContext: {} } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(true);
  });

  it('should return true when visibleForEntityContext is null', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = { visibleForEntityContext: null } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(true);
  });

  it('should return true when visibleForEntityContext is undefined', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = {} as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(true);
  });

  it('should return false when entityContext is null', () => {
    const ctx = { entityContext: null };
    const node = {
      visibleForEntityContext: { type: 'admin' },
    } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(false);
  });

  it('should return false when entityContext is undefined', () => {
    const ctx = {};
    const node = {
      visibleForEntityContext: { type: 'admin' },
    } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(false);
  });

  it('should match nested objects in visibleForEntityContext', () => {
    const ctx = { entityContext: { settings: { theme: 'dark', lang: 'en' } } };
    const node = {
      visibleForEntityContext: { settings: { theme: 'dark' } },
    } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(true);
  });

  it('should return false when nested objects do not match', () => {
    const ctx = { entityContext: { settings: { theme: 'light' } } };
    const node = {
      visibleForEntityContext: { settings: { theme: 'dark' } },
    } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(false);
  });

  it('should compare array values directly (not as objects)', () => {
    const ctx = { entityContext: { tags: ['a', 'b'] } };
    const node = {
      visibleForEntityContext: { tags: ['a', 'b'] },
    } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(false);
  });

  it('should match when source has null value and object has null', () => {
    const ctx = { entityContext: { value: null } };
    const node = {
      visibleForEntityContext: { value: null },
    } as any as LuigiNode;

    expect(visibleForContext(ctx, node)).toBe(true);
  });
});

describe('computeFetchContext', () => {
  it('should create empty context map when node has no entity definitions', () => {
    const entityNode = {} as LuigiNode;
    const ctx = { userId: 'user1' } as LuigiGlobalContext;

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.size).toBe(0);
  });

  it('should add user to all contexts', () => {
    const entityNode = {
      defineEntity: {
        contextKey: 'projectId',
        dynamicFetchId: 'project',
      },
    } as LuigiNode;
    const ctx = {
      projectId: 'proj1',
      userId: 'user1',
    } as any as LuigiGlobalContext;

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.size).toBe(1);
    expect(result.get('project')).toEqual({ project: 'proj1', user: 'user1' });
  });

  it('should use userid if userId is not available', () => {
    const entityNode = {
      defineEntity: {
        contextKey: 'projectId',
        dynamicFetchId: 'project',
      },
    } as LuigiNode;
    const ctx = {
      projectId: 'proj1',
      userid: 'user1',
    } as unknown as LuigiGlobalContext;

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.get('project')).toEqual({ project: 'proj1', user: 'user1' });
  });

  it('should omit context keys if not present', () => {
    const entityNode = {
      defineEntity: {
        contextKey: 'projectId',
        additionalContextKeys: ['myUserId'],
        dynamicFetchId: 'project',
      },
    } as LuigiNode;
    const ctx = {
      projectId: 'proj1',
      userid: 'user1',
    } as unknown as LuigiGlobalContext;

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.get('project')).toStrictEqual({
      project: 'proj1',
      user: 'user1',
    });
  });

  it('should include additionalContextKeys when present in context', () => {
    const entityNode = {
      defineEntity: {
        contextKey: 'projectId',
        additionalContextKeys: ['region'],
        dynamicFetchId: 'project',
      },
    } as LuigiNode;
    const ctx = {
      projectId: 'proj1',
      region: 'eu',
      userId: 'user1',
    } as any as LuigiGlobalContext;

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.get('project')).toStrictEqual({
      project: 'proj1',
      region: 'eu',
      user: 'user1',
    });
  });

  it('should process parent nodes with entity definitions', () => {
    const parent = {
      defineEntity: {
        contextKey: 'tenantId',
        dynamicFetchId: 'tenant',
      },
    };

    const entityNode = {
      defineEntity: {
        contextKey: 'projectId',
        dynamicFetchId: 'project',
      },
      parent,
    } as unknown as LuigiNode;

    const ctx = {
      projectId: 'proj1',
      tenantId: 'tenant1',
      userId: 'user1',
    };

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.size).toBe(2);
    expect(result.get('project')).toEqual({
      project: 'proj1',
      tenant: 'tenant1',
      user: 'user1',
    });
    expect(result.get('tenant')).toEqual({
      tenant: 'tenant1',
      user: 'user1',
    });
  });

  it('should handle multiple levels of parent nodes', () => {
    const grandparent = {
      defineEntity: {
        contextKey: 'orgId',
        dynamicFetchId: 'org',
      },
    };

    const parent = {
      defineEntity: {
        contextKey: 'tenantId',
        dynamicFetchId: 'tenant',
      },
      parent: grandparent,
    };

    const entityNode = {
      defineEntity: {
        contextKey: 'projectId',
        dynamicFetchId: 'project',
      },
      parent,
    } as unknown as LuigiNode;

    const ctx = {
      projectId: 'proj1',
      tenantId: 'tenant1',
      orgId: 'org1',
      userId: 'user1',
    } as any as LuigiGlobalContext;

    const result = computeDynamicFetchContext(entityNode, ctx);

    expect(result.size).toBe(3);
    expect(result.get('project')).toEqual({
      project: 'proj1',
      tenant: 'tenant1',
      org: 'org1',
      user: 'user1',
    });
    expect(result.get('tenant')).toEqual({
      tenant: 'tenant1',
      org: 'org1',
      user: 'user1',
    });
    expect(result.get('org')).toEqual({
      org: 'org1',
      user: 'user1',
    });
  });
});

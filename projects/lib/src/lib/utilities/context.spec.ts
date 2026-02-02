import { LuigiGlobalContext, LuigiNode, NodeContext } from '../models';
import { computeDynamicFetchContext, visibleForContext } from './context';
import { describe, expect, it } from 'vitest';

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

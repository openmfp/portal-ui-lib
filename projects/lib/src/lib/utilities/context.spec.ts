import { LuigiGlobalContext, LuigiNode } from '../models';
import { computeDynamicFetchContext, visibleForContext } from './context';
import { matchesJMESPath } from './jmespath';
import { isMatch } from 'lodash';

jest.mock('./jmespath');
jest.mock('lodash', () => ({
  isMatch: jest.fn(),
}));

describe('visibleForContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (isMatch as jest.Mock).mockReturnValue(true);
    (matchesJMESPath as jest.Mock).mockReturnValue(true);
  });

  it('should return false when entityContext does not match', () => {
    const ctx = { entityContext: { type: 'user' } };
    const node = { visibleForEntityContext: { type: 'admin' } } as LuigiNode;

    (isMatch as jest.Mock).mockReturnValue(false);

    const result = visibleForContext(ctx, node);

    expect(isMatch).toHaveBeenCalledWith(
      ctx.entityContext,
      node.visibleForEntityContext,
    );
    expect(result).toBe(false);
  });

  it('should return true when all checks pass', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = {
      visibleForEntityContext: { type: 'admin' },
      visibleForContext: { expression: 'someExpression' },
    } as any as LuigiNode;

    (isMatch as jest.Mock).mockReturnValue(true);
    (matchesJMESPath as jest.Mock).mockReturnValue(true);

    const result = visibleForContext(ctx, node);

    expect(isMatch).toHaveBeenCalledWith(
      ctx.entityContext,
      node.visibleForEntityContext,
    );
    expect(matchesJMESPath).toHaveBeenCalledWith(ctx, node.visibleForContext);
    expect(result).toBe(true);
  });

  it('should return false when JMESPath does not match', () => {
    const ctx = { entityContext: { type: 'admin' } };
    const node = {
      visibleForEntityContext: { type: 'admin' },
      visibleForContext: { expression: 'someExpression' },
    } as any as LuigiNode;

    (isMatch as jest.Mock).mockReturnValue(true);
    (matchesJMESPath as jest.Mock).mockReturnValue(false);

    const result = visibleForContext(ctx, node);

    expect(isMatch).toHaveBeenCalledWith(
      ctx.entityContext,
      node.visibleForEntityContext,
    );
    expect(matchesJMESPath).toHaveBeenCalledWith(ctx, node.visibleForContext);
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

import { LuigiNode } from '../models';
import { matchesJMESPath } from './jmespath';
import _ from 'lodash';

export const visibleForContext = (ctx: any, node: LuigiNode): boolean => {
  // visibleForEntityContext is deprecated
  if (!_.isMatch(ctx.entityContext, node.visibleForEntityContext)) {
    return false;
  }

  return matchesJMESPath(ctx, node.visibleForContext);
};

export const computeFetchContext = (
  entityNode: LuigiNode,
  ctx: any,
): Map<string, Record<string, string>> => {
  const contextForEntityConfig: Map<string, Record<string, string>> = new Map();

  function addToAll(key: string, value: string) {
    contextForEntityConfig.forEach((record) => {
      record[key] = value;
    });
  }

  let node = entityNode as any;
  while (node) {
    if (node.defineEntity?.contextKey && node.defineEntity?.dynamicFetchId) {
      contextForEntityConfig.set(node.defineEntity.dynamicFetchId, {});
      addToAll(
        node.defineEntity.dynamicFetchId,
        ctx[node.defineEntity.contextKey],
      );
    }
    node = node.parent;
  }

  addToAll('user', ctx.userId || ctx.userid);
  return contextForEntityConfig;
};

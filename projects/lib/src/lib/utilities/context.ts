import { LuigiNode } from '../models';
import { matchesJMESPath } from './jmespath';
import { isMatch } from 'lodash';

export const visibleForContext = (ctx: any, node: LuigiNode): boolean => {
  // visibleForEntityContext is deprecated
  if (!isMatch(ctx?.entityContext, node.visibleForEntityContext)) {
    return false;
  }

  return matchesJMESPath(ctx, node.visibleForContext ?? '');
};

export const computeDynamicFetchContext = (
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

      if (node.defineEntity?.additionalContextKeys) {
        node.defineEntity.additionalContextKeys.forEach((key: string) => {
          const value = ctx[key];
          if (value) {
            addToAll(key, ctx[key]);
          }
        });
      }
    }
    node = node.parent;
  }

  addToAll('user', ctx.userId || ctx.userid);
  return contextForEntityConfig;
};

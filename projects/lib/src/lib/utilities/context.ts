import { LuigiNode } from '../models';
import { matchesJMESPath } from './jmespath';

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((val: any, i: number) => deepEqual(val, b[i]));
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => deepEqual(a[key], b[key]));
}

function isMatch(object: any, source: Record<string, any>): boolean {
  if (source == null || Object.keys(source).length === 0) return true;
  if (object == null) return false;
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const objVal = object[key];
    if (srcVal !== null && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      if (!isMatch(objVal, srcVal)) return false;
    } else if (!deepEqual(objVal, srcVal)) {
      return false;
    }
  }
  return true;
}

export const visibleForContext = (ctx: any, node: LuigiNode): boolean => {
  // visibleForEntityContext is deprecated
  if (!isMatch(ctx?.entityContext, node.visibleForEntityContext ?? {})) {
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
            addToAll(key, value);
          }
        });
      }
    }
    node = node.parent;
  }

  addToAll('user', ctx.userId || ctx.userid);
  return contextForEntityConfig;
};

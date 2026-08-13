export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== (b as unknown[]).length) return false;
    return a.every((val, i) => deepEqual(val, (b as unknown[])[i]));
  }
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => key in objB && deepEqual(objA[key], objB[key]));
}

export const isEqual = deepEqual;

export function isMatch(object: any, source: Record<string, any>): boolean {
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

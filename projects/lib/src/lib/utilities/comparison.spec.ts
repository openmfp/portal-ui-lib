import { deepEqual, isEqual, isMatch } from './comparison';

describe('deepEqual', () => {
  it('should return true for identical primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('should return false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('a', 'b')).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
  });

  it('should return false when one value is null or undefined', () => {
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
    expect(deepEqual(undefined, {})).toBe(false);
  });

  it('should return false when types differ', () => {
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual({}, 'object')).toBe(false);
  });

  it('should return false when one is array and other is object', () => {
    expect(deepEqual([], {})).toBe(false);
    expect(deepEqual({}, [])).toBe(false);
  });

  it('should compare arrays element by element', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(deepEqual([1, 2], [1, 3])).toBe(false);
  });

  it('should compare nested arrays', () => {
    expect(deepEqual([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
    expect(deepEqual([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
  });

  it('should compare objects structurally regardless of key order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });

  it('should return false when objects have different key counts', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it('should return false when key exists in a but not in b', () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
  });

  it('should compare nested objects', () => {
    expect(deepEqual({ x: { y: 1 } }, { x: { y: 1 } })).toBe(true);
    expect(deepEqual({ x: { y: 1 } }, { x: { y: 2 } })).toBe(false);
  });

  it('should return false for non-plain objects with different state', () => {
    expect(deepEqual(new Date(0), new Date(1))).toBe(false);
    expect(deepEqual(new Date(0), {})).toBe(false);
    expect(deepEqual(/abc/, /def/)).toBe(false);
  });
});

describe('isEqual', () => {
  it('should be the same function as deepEqual', () => {
    expect(isEqual).toBe(deepEqual);
  });
});

describe('isMatch', () => {
  it('should return true when source is null or undefined', () => {
    expect(isMatch({ a: 1 }, null as any)).toBe(true);
    expect(isMatch({ a: 1 }, undefined as any)).toBe(true);
  });

  it('should return true when source is empty object', () => {
    expect(isMatch({ a: 1 }, {})).toBe(true);
  });

  it('should return false when object is null or undefined', () => {
    expect(isMatch(null, { a: 1 })).toBe(false);
    expect(isMatch(undefined, { a: 1 })).toBe(false);
  });

  it('should match when object contains all source properties', () => {
    expect(isMatch({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).toBe(true);
  });

  it('should return false when object is missing source property value', () => {
    expect(isMatch({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('should deep-match nested objects (partial)', () => {
    expect(isMatch({ x: { a: 1, b: 2 } }, { x: { a: 1 } })).toBe(true);
    expect(isMatch({ x: { a: 1 } }, { x: { a: 2 } })).toBe(false);
  });

  it('should deep-match array values', () => {
    expect(isMatch({ tags: ['a', 'b'] }, { tags: ['a', 'b'] })).toBe(true);
    expect(isMatch({ tags: ['a'] }, { tags: ['b'] })).toBe(false);
  });

  it('should match null values in source', () => {
    expect(isMatch({ val: null }, { val: null })).toBe(true);
    expect(isMatch({ val: 1 }, { val: null })).toBe(false);
  });

  it('should return false when source key does not exist in object', () => {
    expect(isMatch({}, { flag: undefined })).toBe(false);
    expect(isMatch({ other: 1 }, { missing: 'x' })).toBe(false);
  });

  it('should do partial unordered array matching', () => {
    expect(isMatch({ tags: ['admin', 'auditor'] }, { tags: ['admin'] })).toBe(true);
    expect(isMatch({ tags: ['auditor', 'admin'] }, { tags: ['admin'] })).toBe(true);
    expect(isMatch({ tags: ['user'] }, { tags: ['admin'] })).toBe(false);
  });

  it('should match when source array is a subset regardless of order', () => {
    expect(isMatch({ items: [1, 2, 3] }, { items: [3, 1] })).toBe(true);
    expect(isMatch({ items: [1, 2] }, { items: [3] })).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { matchesJMESPath, transformLegacyBacktickLiterals } from './jmespath';

describe('transformLegacyBacktickLiterals', () => {
  it('should return expression unchanged when no backticks present', () => {
    expect(transformLegacyBacktickLiterals('a.b == c')).toBe('a.b == c');
  });

  it('should wrap unquoted string in quotes', () => {
    expect(transformLegacyBacktickLiterals('a == `admin`')).toBe(
      'a == `"admin"`',
    );
  });

  it('should not modify already-quoted strings', () => {
    expect(transformLegacyBacktickLiterals('a == `"admin"`')).toBe(
      'a == `"admin"`',
    );
  });

  it('should not modify boolean literals', () => {
    expect(transformLegacyBacktickLiterals('a == `true`')).toBe('a == `true`');
    expect(transformLegacyBacktickLiterals('a == `false`')).toBe(
      'a == `false`',
    );
  });

  it('should not modify null literal', () => {
    expect(transformLegacyBacktickLiterals('a == `null`')).toBe('a == `null`');
  });

  it('should not modify number literals', () => {
    expect(transformLegacyBacktickLiterals('a == `123`')).toBe('a == `123`');
    expect(transformLegacyBacktickLiterals('a == `-3.14`')).toBe(
      'a == `-3.14`',
    );
  });

  it('should not modify array literals', () => {
    expect(transformLegacyBacktickLiterals('a == `[1,2,3]`')).toBe(
      'a == `[1,2,3]`',
    );
  });

  it('should not modify object literals', () => {
    expect(transformLegacyBacktickLiterals('a == `{"key":"val"}`')).toBe(
      'a == `{"key":"val"}`',
    );
  });

  it('should handle multiple backtick literals in one expression', () => {
    expect(
      transformLegacyBacktickLiterals('type == `admin` && role == `editor`'),
    ).toBe('type == `"admin"` && role == `"editor"`');
  });

  it('should handle mixed valid and invalid literals', () => {
    expect(
      transformLegacyBacktickLiterals('type == `admin` && count == `5`'),
    ).toBe('type == `"admin"` && count == `5`');
  });

  it('should handle empty backtick content', () => {
    expect(transformLegacyBacktickLiterals('a == ``')).toBe('a == `""`');
  });

  it('should escape special characters when wrapping', () => {
    expect(transformLegacyBacktickLiterals('a == `he said "hi"`')).toBe(
      'a == `"he said \\"hi\\""`',
    );
  });
});

describe('matchesJMESPath', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return true for no query', () => {
    expect(matchesJMESPath({}, '')).toEqual(true);
  });

  it('should return false for error and log a warning', () => {
    console.warn = vi.fn();
    expect(matchesJMESPath({}, 'invalid@query')).toEqual(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should evaluate using JMESPath', () => {
    expect(matchesJMESPath({ a: true, b: 'test' }, 'a')).toEqual(true);
  });

  it('should handle legacy backtick literals via shim', () => {
    expect(
      matchesJMESPath(
        { entityContext: { type: 'admin' } },
        'entityContext.type == `admin`',
      ),
    ).toEqual(true);
  });

  it('should handle legacy backtick with non-matching value', () => {
    expect(
      matchesJMESPath(
        { entityContext: { type: 'user' } },
        'entityContext.type == `admin`',
      ),
    ).toEqual(false);
  });

  it('should return true if we match the context for a non-existing key', () => {
    console.warn = vi.fn();
    expect(
      matchesJMESPath(
        {
          entityContext: {
            component: {},
          },
        },
        'entityContext.component.annotations."example.com/application-selector" == null',
      ),
    ).toEqual(true);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should catch if a context value which should be an array or string is missing and we use contains', () => {
    console.warn = vi.fn();
    expect(
      matchesJMESPath(
        {
          entityContext: { component: { tags: null } },
        },
        'contains(entityContext.component.tags, "template")',
      ),
    ).toEqual(false);
    expect(console.warn).toHaveBeenCalled();
  });
});

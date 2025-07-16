import { replaceDotsAndHyphensWithUnderscores } from './group-name-sanitizer';

describe('replaceDotsAndHyphensWithUnderscores', () => {
  it('should replace dots with underscores', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test.string')).toBe(
      'test_string',
    );
  });

  it('should replace hyphens with underscores', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test-string')).toBe(
      'test_string',
    );
  });

  it('should replace both dots and hyphens with underscores', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test.string-with.both')).toBe(
      'test_string_with_both',
    );
  });

  it('should handle multiple consecutive dots', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test...string')).toBe(
      'test___string',
    );
  });

  it('should handle multiple consecutive hyphens', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test---string')).toBe(
      'test___string',
    );
  });

  it('should handle mixed consecutive dots and hyphens', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test.-.string')).toBe(
      'test___string',
    );
  });

  it('should handle empty string', () => {
    expect(replaceDotsAndHyphensWithUnderscores('')).toBe('');
  });

  it('should handle string with no dots or hyphens', () => {
    expect(replaceDotsAndHyphensWithUnderscores('teststring')).toBe(
      'teststring',
    );
  });

  it('should handle string with only dots', () => {
    expect(replaceDotsAndHyphensWithUnderscores('...')).toBe('___');
  });

  it('should handle string with only hyphens', () => {
    expect(replaceDotsAndHyphensWithUnderscores('---')).toBe('___');
  });

  it('should handle string starting with dot', () => {
    expect(replaceDotsAndHyphensWithUnderscores('.test')).toBe('_test');
  });

  it('should handle string starting with hyphen', () => {
    expect(replaceDotsAndHyphensWithUnderscores('-test')).toBe('_test');
  });

  it('should handle string ending with dot', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test.')).toBe('test_');
  });

  it('should handle string ending with hyphen', () => {
    expect(replaceDotsAndHyphensWithUnderscores('test-')).toBe('test_');
  });

  it('should handle null input', () => {
    expect(replaceDotsAndHyphensWithUnderscores(null as any)).toBe(null);
  });

  it('should handle undefined input', () => {
    expect(replaceDotsAndHyphensWithUnderscores(undefined as any)).toBe(
      undefined,
    );
  });

  it('should handle complex real-world example', () => {
    expect(replaceDotsAndHyphensWithUnderscores('my-app.v1.0-beta.test')).toBe(
      'my_app_v1_0_beta_test',
    );
  });
});

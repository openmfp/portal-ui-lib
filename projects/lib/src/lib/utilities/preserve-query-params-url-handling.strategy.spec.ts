import { PreserveQueryParamsUrlHandlingStrategy } from './preserve-query-params-url-handling.strategy';
import { UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

describe('PreserveQueryParamsUrlHandlingStrategy', () => {
  let strategy: PreserveQueryParamsUrlHandlingStrategy;

  const urlTree = (queryParams: Record<string, string> = {}): UrlTree => {
    const tree = new UrlTree();
    tree.queryParams = queryParams;
    return tree;
  };

  beforeEach(() => {
    strategy = new PreserveQueryParamsUrlHandlingStrategy();
  });

  describe('shouldProcessUrl', () => {
    it('always returns true so Luigi still bootstraps via the ** route', () => {
      expect(strategy.shouldProcessUrl(urlTree())).toBe(true);
    });
  });

  describe('extract', () => {
    it('returns the url unchanged', () => {
      const tree = urlTree({ q: 'foo' });
      expect(strategy.extract(tree)).toBe(tree);
    });
  });

  describe('merge', () => {
    const setLocationSearch = (search: string) => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search, href: `http://x${search}` },
        writable: true,
        configurable: true,
      });
    };

    it('injects the live location.search params when the router built none', () => {
      setLocationSearch('?q=foo&page=2&owner=me');
      const newUrlPart = urlTree();
      const wholeUrl = urlTree();

      const result = strategy.merge(newUrlPart, wholeUrl);

      expect(result).toBe(newUrlPart);
      expect(result.queryParams).toEqual({ q: 'foo', page: '2', owner: 'me' });
    });

    it('keeps the router query params when navigation supplied its own', () => {
      setLocationSearch('?q=foo');
      const newUrlPart = urlTree({ redirect: 'welcome' });
      const wholeUrl = urlTree();

      const result = strategy.merge(newUrlPart, wholeUrl);

      expect(result).toBe(newUrlPart);
      expect(result.queryParams).toEqual({ redirect: 'welcome' });
    });

    it('leaves query params untouched when location.search is empty', () => {
      setLocationSearch('');
      const newUrlPart = urlTree();
      const wholeUrl = urlTree();

      const result = strategy.merge(newUrlPart, wholeUrl);

      expect(result.queryParams).toEqual({});
    });

    it('decodes encoded values from location.search', () => {
      setLocationSearch(
        `?${encodeURIComponent('metadata.name')}=${encodeURIComponent('a/b c')}`,
      );
      const newUrlPart = urlTree();
      const wholeUrl = urlTree();

      const result = strategy.merge(newUrlPart, wholeUrl);

      expect(result.queryParams).toEqual({ 'metadata.name': 'a/b c' });
    });
  });
});

import { matchesJMESPath } from './jmespath';

describe('matchesJMESPath', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for no query', () => {
    expect(matchesJMESPath({}, '')).toEqual(true);
  });
  it('should return true for error and log a warning', () => {
    console.warn = jest.fn();
    expect(matchesJMESPath({}, 'invalid@query')).toEqual(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should evaluate using JMESPath', () => {
    expect(matchesJMESPath({ a: true, b: 'test' }, 'a')).toEqual(true);
  });

  it('should return true if we match the context for a non-existing key', () => {
    console.warn = jest.fn();
    expect(
      matchesJMESPath(
        {
          entityContext: {
            component: {},
          },
        },
        'entityContext.component.annotations."example.com/application-selector" == null'
      )
    ).toEqual(true);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should catch if a context value which should be an array or string is missing and we use contains', () => {
    console.warn = jest.fn();
    expect(
      matchesJMESPath(
        {
          entityContext: { component: { tags: null } },
        },
        'contains(entityContext.component.tags, "hyperspace-template")'
      )
    ).toEqual(false);
    expect(console.warn).toHaveBeenCalled();
  });
});

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    key: (i) => Array.from(store.keys())[i] ?? null,
    removeItem: (k) => {
      store.delete(k);
    },
    setItem: (k, v) => {
      store.set(k, String(v));
    },
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    writable: true,
    configurable: true,
  });
}

if (
  typeof globalThis.window !== 'undefined' &&
  typeof (globalThis.window as any).localStorage === 'undefined'
) {
  Object.defineProperty(globalThis.window, 'localStorage', {
    value: globalThis.localStorage,
    writable: true,
    configurable: true,
  });
}

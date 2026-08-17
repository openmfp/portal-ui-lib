import * as wc from './wc';
import { Injector, Type } from '@angular/core';
import * as angularElements from '@angular/elements';
import { MockedFunction } from 'vitest';
import { mock } from 'vitest-mock-extended';

vi.mock('@angular/elements', () => ({
  createCustomElement: vi.fn(),
}));

describe('Luigi WebComponents Utils', () => {
  let originalCurrentScript: any;

  const setCurrentScript = (src: string | null) => {
    Object.defineProperty(document, 'currentScript', {
      value: { getAttribute: () => src },
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    originalCurrentScript = document.currentScript;
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(document, 'currentScript', {
      value: originalCurrentScript,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('registerLuigiWebComponent', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    const src = 'src-of-the-script';

    const createCustomElementSpy = (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = vi.fn();
    // @ts-ignore
    window.Luigi = { _registerWebcomponent };

    setCurrentScript(src);

    wc.registerLuigiWebComponent(component, injector);

    expect(createCustomElementSpy).toHaveBeenCalledWith(component, {
      injector,
    });
    expect(_registerWebcomponent).toHaveBeenCalledWith(src, element);
  });

  it('registerLuigiWebComponents', () => {
    const component1 = mock<Type<any>>();
    const component2 = mock<Type<any>>();
    const components = {
      component1,
      component2,
    };
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    const createCustomElementSpy = (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = vi.fn();
    // @ts-ignore
    window.Luigi = { _registerWebcomponent };

    setCurrentScript('http://localhost:12345/main.js#component1');

    wc.registerLuigiWebComponents(components, injector);

    expect(createCustomElementSpy).toHaveBeenCalledWith(component1, {
      injector,
    });
    expect(_registerWebcomponent).toHaveBeenCalledWith(
      'http://localhost:12345/main.js#component1',
      element,
    );
  });

  it('registerLuigiWebComponents no hash', () => {
    const component1 = mock<Type<any>>();
    const component2 = mock<Type<any>>();
    const components = {
      component1,
      component2,
    };
    const injector = mock<Injector>();
    const createCustomElementSpy = (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(mock<angularElements.NgElementConstructor<any>>());

    setCurrentScript('http://localhost:12345/main.js');

    wc.registerLuigiWebComponents(components, injector);

    expect(createCustomElementSpy).not.toHaveBeenCalled();
  });

  it('registerLuigiWebComponents no corresponding component', () => {
    const component1 = mock<Type<any>>();
    const component2 = mock<Type<any>>();
    const components = {
      component1,
      component2,
    };
    const injector = mock<Injector>();
    const createCustomElementSpy = (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(mock<angularElements.NgElementConstructor<any>>());

    setCurrentScript('http://localhost:12345/main.js#component7');

    wc.registerLuigiWebComponents(components, injector);

    expect(createCustomElementSpy).not.toHaveBeenCalled();
  });

  describe('getSrc', () => {
    it('should return the currentScript src when present', () => {
      setCurrentScript('http://localhost:12345/main.js#component1');
      expect(wc.getSrc()).toBe('http://localhost:12345/main.js#component1');
    });

    it('should fall back to import.meta.url when currentScript has no src', () => {
      setCurrentScript(null);
      const src = wc.getSrc();
      expect(src).toBeTruthy();
      expect(typeof src).toBe('string');
    });
  });
});

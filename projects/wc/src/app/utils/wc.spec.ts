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
    wc.resetCapturedSrc();
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

  it('registerLuigiWebComponent with explicit url', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();

    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = vi.fn();
    // @ts-ignore
    window.Luigi = { _registerWebcomponent };

    wc.registerLuigiWebComponent(
      component,
      injector,
      'http://localhost:12345/main.js#explicit',
    );

    expect(_registerWebcomponent).toHaveBeenCalledWith(
      'http://localhost:12345/main.js#explicit',
      element,
    );
  });

  it('registerLuigiWebComponents registers every component under its own url hash', () => {
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
    expect(createCustomElementSpy).toHaveBeenCalledWith(component2, {
      injector,
    });
    expect(_registerWebcomponent).toHaveBeenCalledWith(
      'http://localhost:12345/main.js#component1',
      element,
    );
    expect(_registerWebcomponent).toHaveBeenCalledWith(
      'http://localhost:12345/main.js#component2',
      element,
    );
  });

  it('registerLuigiWebComponents derives the base url when the current src has no hash', () => {
    const component1 = mock<Type<any>>();
    const components = { component1 };
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    (
      angularElements.createCustomElement as MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = vi.fn();
    // @ts-ignore
    window.Luigi = { _registerWebcomponent };

    setCurrentScript('http://localhost:12345/main.js');

    wc.registerLuigiWebComponents(components, injector);

    expect(_registerWebcomponent).toHaveBeenCalledWith(
      'http://localhost:12345/main.js#component1',
      element,
    );
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

    it('should return capturedSrc when currentScript is null', () => {
      const src = 'http://localhost:4200/assets/openmfp-portal-ui-wc.js#development-settings';

      Object.defineProperty(document, 'currentScript', {
        value: null,
        writable: true,
        configurable: true,
      });

      wc.setCapturedSrc(src);

      expect(wc.getSrc()).toEqual(src);
    });

    it('should prefer currentScript.src over capturedSrc', () => {
      const currentScriptSrc = 'http://localhost:3000/assets/openmfp-portal-ui-wc.js#development-settings';
      const capturedSrc = 'http://localhost:4200/assets/openmfp-portal-ui-wc.js#development-settings';

      Object.defineProperty(document, 'currentScript', {
        value: { getAttribute: () => currentScriptSrc },
        writable: true,
        configurable: true,
      });

      wc.setCapturedSrc(capturedSrc);

      expect(wc.getSrc()).toEqual(currentScriptSrc);
    });

    it('should fall back to import.meta.url when both currentScript and capturedSrc are not set', () => {
      Object.defineProperty(document, 'currentScript', {
        value: null,
        writable: true,
        configurable: true,
      });

      const src = wc.getSrc();
      // import.meta.url is always defined in ES modules, so we expect a valid string
      expect(src).toBeTruthy();
      expect(typeof src).toBe('string');
    });

    it('should fall back to import.meta.url when setCapturedSrc is called with null', () => {
      Object.defineProperty(document, 'currentScript', {
        value: null,
        writable: true,
        configurable: true,
      });

      wc.setCapturedSrc(null);

      const src = wc.getSrc();
      // import.meta.url is always defined in ES modules, so we expect a valid string
      expect(src).toBeTruthy();
      expect(typeof src).toBe('string');
    });
  });
});

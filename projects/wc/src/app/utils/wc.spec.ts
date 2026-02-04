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

    Object.defineProperty(document, 'currentScript', {
      value: {
        getAttribute: () => src,
      },
      writable: true,
      configurable: true,
    });

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

    Object.defineProperty(document, 'currentScript', {
      value: {
        getAttribute: () => 'http://localhost:12345/main.js#component1',
      },
      writable: true,
      configurable: true,
    });

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

    Object.defineProperty(document, 'currentScript', {
      value: {
        getAttribute: () => 'http://localhost:12345/main.js',
      },
      writable: true,
      configurable: true,
    });

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

    Object.defineProperty(document, 'currentScript', {
      value: {
        getAttribute: () => 'http://localhost:12345/main.js#component7',
      },
      writable: true,
      configurable: true,
    });

    wc.registerLuigiWebComponents(components, injector);

    expect(createCustomElementSpy).not.toHaveBeenCalled();
  });

  describe('getSrc', () => {
    it('should throw error when src attribute does not exist', () => {
      Object.defineProperty(document, 'currentScript', {
        value: {
          getAttribute: () => null,
        },
        writable: true,
      });

      expect(() => wc.getSrc()).toThrow('Not defined src of currentScript.');
    });

    it('should throw error when currentScript is null', () => {
      Object.defineProperty(document, 'currentScript', {
        value: null,
        writable: true,
      });

      expect(() => wc.getSrc()).toThrow('Not defined src of currentScript.');
    });

    it('should throw error when currentScript is undefined', () => {
      Object.defineProperty(document, 'currentScript', {
        value: undefined,
        writable: true,
      });

      expect(() => wc.getSrc()).toThrow('Not defined src of currentScript.');
    });

    it('should throw error when getAttribute returns empty string', () => {
      Object.defineProperty(document, 'currentScript', {
        value: {
          getAttribute: () => '',
        },
        writable: true,
      });

      expect(() => wc.getSrc()).toThrow('Not defined src of currentScript.');
    });

    it('should get src', () => {
      const src = 'http://localhost:12345/main.js#component1';

      Object.defineProperty(document, 'currentScript', {
        value: {
          getAttribute: () => src,
        },
        writable: true,
      });

      expect(wc.getSrc()).toEqual(src);
    });
  });
});

import * as wc from './wc';
import { Injector, Type } from '@angular/core';
import * as angularElements from '@angular/elements';
import {
  MockedFunction,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { mock } from 'vitest-mock-extended';

vi.mock('@angular/elements', () => ({
  createCustomElement: vi.fn(),
}));

describe('Luigi WebComponents Utils', () => {
  afterEach(() => {
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

    const getSrcSpy = vi.spyOn(wc, 'getSrc').mockReturnValue(src);

    wc.registerLuigiWebComponent(component, injector);

    expect(createCustomElementSpy).toHaveBeenCalledWith(component, {
      injector,
    });
    expect(getSrcSpy).toHaveBeenCalled();
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

    const getSrcSpy = vi
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component1');

    const registerLuigiWebComponentSpy = vi
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(components, injector);

    expect(getSrcSpy).toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).toHaveBeenCalledWith(
      component1,
      injector,
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

    const getSrcSpy = vi
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js');

    const registerLuigiWebComponentSpy = vi
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(components, injector);

    expect(getSrcSpy).toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).not.toHaveBeenCalled();
  });

  it('registerLuigiWebComponents no corresponding component', () => {
    const component1 = mock<Type<any>>();
    const component2 = mock<Type<any>>();
    const components = {
      component1,
      component2,
    };
    const injector = mock<Injector>();

    const getSrcSpy = vi
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component7');

    const registerLuigiWebComponentSpy = vi
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(components, injector);

    expect(getSrcSpy).toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).not.toHaveBeenCalled();
  });

  describe('getSrc', () => {
    let originalCurrentScript: any;

    beforeEach(() => {
      originalCurrentScript = document.currentScript;
    });

    afterEach(() => {
      Object.defineProperty(document, 'currentScript', {
        value: originalCurrentScript,
        writable: true,
      });
    });

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

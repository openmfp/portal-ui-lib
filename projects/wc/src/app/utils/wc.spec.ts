import * as wc from './wc';
import { mock } from 'jest-mock-extended';
import { Injector, Type } from '@angular/core';

jest.mock('@angular/elements', () => ({
  createCustomElement: jest.fn(),
}));

import * as angularElements from '@angular/elements';

describe('Luigi WebComponents Utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registerLuigiWebComponent', () => {
    const component = mock<Type<any>>();
    const injector = mock<Injector>();
    const element = mock<angularElements.NgElementConstructor<any>>();
    const src = 'src-of-the-script';

    const createCustomElementSpy = (
      angularElements.createCustomElement as jest.MockedFunction<
        typeof angularElements.createCustomElement
      >
    ).mockReturnValue(element);
    const _registerWebcomponent = jest.fn();
    // @ts-ignore
    window.Luigi = { _registerWebcomponent };

    const getSrcSpy = jest.spyOn(wc, 'getSrc').mockReturnValue(src);

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

    const getSrcSpy = jest
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component1');

    const registerLuigiWebComponentSpy = jest
      .spyOn(wc, 'registerLuigiWebComponent')
      .mockReturnValue(void 0);

    wc.registerLuigiWebComponents(components, injector);

    expect(getSrcSpy).toHaveBeenCalled();
    expect(registerLuigiWebComponentSpy).toHaveBeenCalledWith(
      component1,
      injector
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

    const getSrcSpy = jest
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js');

    const registerLuigiWebComponentSpy = jest
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

    const getSrcSpy = jest
      .spyOn(wc, 'getSrc')
      .mockReturnValue('http://localhost:12345/main.js#component7');

    const registerLuigiWebComponentSpy = jest
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

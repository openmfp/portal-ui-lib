import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';

/**
 * Holds the WC script src captured synchronously in main.ts before the async
 * Angular bootstrap. document.currentScript is only valid during synchronous
 * script execution — by the time APP_INITIALIZER runs it is already null.
 */
let _capturedSrc: string | undefined;

/**
 * Call this at the top of main.ts (before createApplication) to capture the
 * script src while document.currentScript is still available.
 */
export const setCapturedSrc = (src: string | null | undefined): void => {
  if (src) {
    _capturedSrc = src;
  }
};

/** @internal — only for unit tests */
export const resetCapturedSrc = (): void => {
  _capturedSrc = undefined;
};

export const registerLuigiWebComponent = (
  component: Type<any>,
  injector: Injector,
  url: string = getSrc(),
) => {
  const el = createCustomElement(component, { injector });
  (window as any).Luigi._registerWebcomponent(url, el);
};

/**
 * When there are multiple web components in the same Angular project, use this method to register them.
 * In the content-configuration.json, set the hash of the urlSuffix to the key of this map.
 *
 * @param components
 * @param injector
 */
export const registerLuigiWebComponents = (
  components: Record<string, Type<any>>,
  injector: Injector,
) => {
  const base = getSrc().split('#')[0];
  Object.entries(components).forEach(([hash, component]) => {
    registerLuigiWebComponent(component, injector, `${base}#${hash}`);
  });
};

export const getSrc = () => {
  const src = document.currentScript?.getAttribute('src') ?? _capturedSrc ?? import.meta.url;
  if (!src) {
    throw new Error('Not defined src of currentScript.');
  }
  return src;
};

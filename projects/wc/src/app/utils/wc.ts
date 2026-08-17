import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';

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
  const src = document.currentScript?.getAttribute('src') ?? import.meta.url;
  if (!src) {
    throw new Error('Not defined src of currentScript.');
  }
  return src;
};

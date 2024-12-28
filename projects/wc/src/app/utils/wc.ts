import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';

export const registerLuigiWebComponent = (
  component: Type<any>,
  injector: Injector
) => {
  const el = createCustomElement(component, { injector });
  (window as any).Luigi._registerWebcomponent(getSrc(), el);
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
  injector: Injector
) => {
  const hash = getSrc().split('#')[1];
  if (!hash || !components[hash]) {
    return;
  }
  return registerLuigiWebComponent(components[hash], injector);
};

export const getSrc = () => {
  const src = document.currentScript?.getAttribute('src');
  if (!src) {
    throw new Error('Not defined src of currentScript.');
  }
  return src;
};

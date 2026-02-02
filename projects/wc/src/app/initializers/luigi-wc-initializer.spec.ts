import { DevelopmentSettingsComponent } from '../components/development-settings/development-settings.component';
import { FeatureToggleComponent } from '../components/feature-toggle/feature-toggle.component';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import { provideLuigiWebComponents } from './luigi-wc-initializer';
import { APP_INITIALIZER, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as angularElements from '@angular/elements';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@angular/elements', () => ({
  createCustomElement: vi.fn(),
}));

describe('provideLuigiWebComponents', () => {
  let provider: any;
  let originalCurrentScript: any;
  let originalLuigi: any;

  const setCurrentScript = (src: string) => {
    Object.defineProperty(document, 'currentScript', {
      value: {
        getAttribute: () => src,
      },
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    provider = provideLuigiWebComponents();
    originalCurrentScript = document.currentScript;
    originalLuigi = (window as any).Luigi;
    (window as any).Luigi = { _registerWebcomponent: vi.fn() };
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(document, 'currentScript', {
      value: originalCurrentScript,
      writable: true,
      configurable: true,
    });
    (window as any).Luigi = originalLuigi;
    vi.restoreAllMocks();
  });

  it('should return provider object', () => {
    expect(provider).toBeDefined();
    expect(provider.provide).toBe(APP_INITIALIZER);
    expect(provider.useFactory).toBeDefined();
    expect(provider.multi).toBe(true);
  });

  it('should register components and return undefined', () => {
    const element = {};
    const createCustomElementSpy = vi
      .mocked(angularElements.createCustomElement)
      .mockReturnValue(element as any);

    setCurrentScript('http://localhost:12345/main.js#development-settings');

    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });

    const injector = TestBed.inject(Injector);
    const factoryFn = TestBed.runInInjectionContext(() => provider.useFactory());
    const returnedFn = factoryFn();

    expect(returnedFn).toBeUndefined();
    expect(createCustomElementSpy).toHaveBeenCalledWith(
      DevelopmentSettingsComponent,
      { injector },
    );
    expect((window as any).Luigi._registerWebcomponent).toHaveBeenCalledWith(
      'http://localhost:12345/main.js#development-settings',
      element,
    );
  });

  it('should register each component when hash matches', () => {
    const element = {};
    const createCustomElementSpy = vi
      .mocked(angularElements.createCustomElement)
      .mockReturnValue(element as any);

    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });

    const components = {
      'development-settings': DevelopmentSettingsComponent,
      'getting-started': GettingStartedComponent,
      'feature-toggle': FeatureToggleComponent,
    };

    Object.keys(components).forEach((hash) => {
      setCurrentScript(`http://localhost:12345/main.js#${hash}`);
      TestBed.runInInjectionContext(() => provider.useFactory());
    });

    expect(createCustomElementSpy.mock.calls.map(([component]) => component)).toEqual(
      expect.arrayContaining(Object.values(components)),
    );
  });
});

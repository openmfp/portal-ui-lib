import { provideLuigiWebComponents } from './luigi-wc-initializer';
import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

vi.mock('@angular/elements', () => ({
  createCustomElement: vi.fn().mockReturnValue(() => () => {}),
}));

describe('provideLuigiWebComponents', () => {
  let originalCurrentScript: any;
  let originalLuigi: any;

  beforeEach(() => {
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

  it('should return environment providers', () => {
    expect(provideLuigiWebComponents()).toBeDefined();
  });

  it('should register the component matching the source hash', () => {
    Object.defineProperty(document, 'currentScript', {
      value: {
        getAttribute: () => 'http://localhost:12345/main.js#development-settings',
      },
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });
    TestBed.inject(EnvironmentInjector);

    expect((window as any).Luigi._registerWebcomponent).toHaveBeenCalledTimes(1);
  });
});

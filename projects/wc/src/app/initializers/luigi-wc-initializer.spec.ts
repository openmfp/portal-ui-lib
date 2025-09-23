import { DevelopmentSettingsComponent } from '../components/development-settings/development-settings.component';
import { ErrorComponent } from '../components/error/error.component';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import * as wcUtils from '../utils/wc';
import { provideLuigiWebComponents } from './luigi-wc-initializer';
import { APP_INITIALIZER, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

jest.mock('../utils/wc', () => ({
  registerLuigiWebComponents: jest.fn(),
}));

describe('provideLuigiWebComponents', () => {
  let provider: any;

  beforeEach(() => {
    provider = provideLuigiWebComponents();
    jest.clearAllMocks();
  });

  it('should return provider object', () => {
    expect(provider).toBeDefined();
    expect(provider.provide).toBe(APP_INITIALIZER);
    expect(provider.useFactory).toBeDefined();
    expect(provider.multi).toBe(true);
  });

  it('useFactory should be a function', () => {
    expect(typeof provider.useFactory).toBe('function');
  });

  it('should return factory function that returns undefined', () => {
    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });

    const factoryFn = TestBed.inject(APP_INITIALIZER)[0];
    const returnedFn = factoryFn();
    expect(returnedFn).toBeUndefined();
  });

  it('should register web components with injector', () => {
    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });

    const injector = TestBed.inject(Injector);
    const factoryFn = TestBed.inject(APP_INITIALIZER)[0];

    factoryFn();

    expect(wcUtils.registerLuigiWebComponents).toHaveBeenCalledWith(
      {
        'error-component': ErrorComponent,
        'development-settings': DevelopmentSettingsComponent,
        'getting-started': GettingStartedComponent,
      },
      injector,
    );
  });

  it('should call registerLuigiWebComponents with correct parameters', () => {
    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });

    const injector = TestBed.inject(Injector);
    const factoryFn = TestBed.inject(APP_INITIALIZER)[0];

    factoryFn();

    expect(wcUtils.registerLuigiWebComponents).toHaveBeenCalledTimes(1);
    expect(wcUtils.registerLuigiWebComponents).toHaveBeenCalledWith(
      {
        'error-component': ErrorComponent,
        'development-settings': DevelopmentSettingsComponent,
        'getting-started': GettingStartedComponent,
      },
      injector,
    );
  });

  it('should verify registerLuigiWebComponents is called with ErrorComponent', () => {
    TestBed.configureTestingModule({
      providers: [provideLuigiWebComponents()],
    });

    const factoryFn = TestBed.inject(APP_INITIALIZER)[0];
    factoryFn();

    const [[components]] = (wcUtils.registerLuigiWebComponents as jest.Mock)
      .mock.calls;
    expect(components['error-component']).toBe(ErrorComponent);
  });
});

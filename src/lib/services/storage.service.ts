import { Injectable } from '@angular/core';

export interface LocalStorageService {
  clearLocalStorage(): void;
  clearLocalConfigStorage(): void;
}

@Injectable({
  providedIn: 'root',
})
export class NoopLocalStorageService implements LocalStorageService {
  constructor() {}

  clearLocalStorage = (): void => {};

  clearLocalConfigStorage = (): void => {};
}

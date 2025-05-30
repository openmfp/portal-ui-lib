import {
  AuthData,
  LuigiConfig,
  LuigiCustomMessage,
  LuigiGlobalContext,
} from '../models';
import { Injectable } from '@angular/core';

const luigi = (globalThis as any).Luigi;

@Injectable({
  providedIn: 'root',
})
export class LuigiCoreService {
  setConfig(config: LuigiConfig) {
    return luigi.setConfig(config);
  }

  get config(): LuigiConfig {
    return luigi.getConfig();
  }

  getConfigValue(key: string) {
    return luigi.getConfigValue(key);
  }

  unloadConfig() {
    return luigi.unload();
  }

  sendCustomMessage(customMessage: LuigiCustomMessage) {
    return luigi.sendCustomMessage(customMessage);
  }

  configChanged(scope?: string) {
    luigi.configChanged(scope);
  }

  customMessages() {
    return luigi.customMessages();
  }

  navigation() {
    return luigi.navigation();
  }

  resetLuigi() {
    luigi.reset();
  }

  clearNavigationCache() {
    if (luigi.clearNavigationCache) {
      luigi.clearNavigationCache();
    }
  }

  showAlert(alert: any) {
    return luigi.showAlert(alert);
  }

  ux() {
    return luigi.ux();
  }

  theming() {
    return luigi.theming();
  }

  i18n() {
    return luigi.i18n();
  }

  globalSearch() {
    return luigi.globalSearch();
  }

  getGlobalContext(): LuigiGlobalContext {
    return luigi.getGlobalContext();
  }

  getWcExtendedContext(): Record<string, any> {
    return (
      document
        .querySelector('.wcContainer')
        ?.querySelector('[lui_web_component]') as any
    )?.extendedContext?.context;
  }

  getWcModalExtendedContext(): Record<string, any> {
    return (
      document
        .querySelector('.iframeModalCtn')
        ?.querySelector('[lui_web_component]') as any
    )?.extendedContext?.context;
  }

  setGlobalContext(
    globalContext: Record<string, any>,
    preventUpdate: boolean = false,
  ) {
    luigi.setGlobalContext(globalContext, preventUpdate);
  }

  setInGlobalContext(
    context: Record<string, any>,
    preventUpdate: boolean = false,
  ) {
    luigi.setGlobalContext(
      { ...this.getGlobalContext(), ...context },
      preventUpdate,
    );
  }

  routing() {
    return luigi.routing();
  }

  setFeatureToggle(featureToggleName: string) {
    luigi.featureToggles().setFeatureToggle(featureToggleName);
  }

  setFeatureToggles(featureToggles: Record<string, boolean>) {
    if (!featureToggles) {
      return;
    }

    for (const featureToggleName of Object.keys(featureToggles)) {
      if (featureToggles[featureToggleName]) {
        this.setFeatureToggle(featureToggleName);
      }
    }
  }

  isFeatureToggleActive(ft: string): boolean {
    return luigi.featureToggles().getActiveFeatureToggleList().includes(ft);
  }

  setAuthData(authData: AuthData) {
    luigi.auth().store.setAuthData(authData);
    luigi.auth().store.setNewlyAuthorized();
  }

  removeAuthData() {
    luigi.auth().store.removeAuthData();
  }

  getAuthData(): AuthData | undefined {
    return luigi.auth().store.getAuthData();
  }

  setCurrentLocale(language: string) {
    luigi.i18n().setCurrentLocale(language);
  }
}

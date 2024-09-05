import { Injectable } from '@angular/core';
import { PortalConfig } from '../models';
const luigi = (globalThis as any).Luigi;

export interface LuigiConfig {
  auth?: any;
  routing?: any;
  settings?: any;
  lifecycleHooks?: any;
  navigation?: any;
  userSettings?: any;
  globalSearch?: any;
}

@Injectable({
  providedIn: 'root',
})
export class LuigiCoreService {
  auth() {
    return luigi.auth();
  }

  setConfig(config: LuigiConfig) {
    return luigi.setConfig(config);
  }

  getConfig(): LuigiConfig {
    return luigi.getConfig();
  }

  getConfigValue(key: string) {
    return luigi.getConfigValue(key);
  }

  unloadConfig() {
    return luigi.unload();
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

  getGlobalContext() {
    return luigi.getGlobalContext();
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
}

export interface SceneConfigData {
  url: string;
  id: string;
}

export interface SceneConfig {
  scene: SceneConfigData;
}

export interface ErrorButtonConfig {
  url: string;
  label: string;
}

export interface ErrorComponentConfig {
  sceneConfig: SceneConfig;
  illustratedMessageTitle: string;
  illustratedMessageText: string;
  buttons: ErrorButtonConfig[];
}

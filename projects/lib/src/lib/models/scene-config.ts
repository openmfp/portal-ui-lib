export interface SceneConfig {
  scene: SceneConfigData;
}

export interface SceneConfigData {
  url: string;
  id: string;
}

export interface ButtonConfig {
  url?: string;
  label?: string;
  route?: { context: string };
}

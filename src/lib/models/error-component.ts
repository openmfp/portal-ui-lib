import { ButtonConfig, SceneConfig } from './scene-config';

export interface ErrorComponentConfig {
  sceneConfig?: SceneConfig;
  illustratedMessageTitle?: string;
  illustratedMessageText?: string;
  buttons?: ButtonConfig[];
}

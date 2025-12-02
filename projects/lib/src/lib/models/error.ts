import { ButtonConfig } from './scene-config';

export interface ErrorComponentConfig {
  scene?: string;
  illustratedMessageTitle?: string;
  illustratedMessageText?: string;
  buttons?: ButtonConfig[];
}

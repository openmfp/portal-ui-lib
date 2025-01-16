export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface ThemingService {
  applyTheme(id: string, reset?: boolean): void;
  getDefaultThemeId(): string;
  getAvailableThemes(): Theme[];
}

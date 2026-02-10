export interface AuthTokenData {
  expires_in: string;
  access_token?: string;
  id_token: string;
}

export interface AuthData {
  accessTokenExpirationDate: number;
  idToken: string;
}

export interface ClientEnvironment extends Record<string, any> {
  idpName: string;
  baseDomain?: string;
  oauthServerUrl?: string;
  clientId?: string;
  userAvatarUrl?: string;
  isLocal: boolean;
  developmentInstance: boolean;
  validWebcomponentUrls?: string;
  authData?: AuthTokenData;
  uiOptions?: string[];
}

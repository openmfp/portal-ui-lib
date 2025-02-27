export interface AuthTokenData {
  expires_in: string;
  access_token: string;
  id_token: string;
}

export interface AuthData {
  accessTokenExpirationDate: number;
  idToken: string;
}

export interface ClientEnvironment {
  oauthServerUrl: string;
  clientId: string;
  isLocal: boolean;
  developmentInstance: boolean;
  validWebcomponentUrls?: string;
  authData: AuthTokenData;
}

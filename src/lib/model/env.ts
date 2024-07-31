export interface AuthTokenData {
  expires_in: string;
  access_token: string;
}

export interface AuthData {
  accessTokenExpirationDate: number;
  idToken: string;
}

export interface ClientEnvironment {
  oauthServerUrl: string;
  clientId: string;
  authData: AuthTokenData;
}

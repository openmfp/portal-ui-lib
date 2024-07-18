import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { lastValueFrom } from 'rxjs';
import { AuthData, AuthTokenData } from '../model/env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authData!: AuthData;

  constructor(private http: HttpClient) {}

  public async auth(code: string, state: string) {
    const response = await lastValueFrom(
      this.http.post<AuthTokenData>(
        `/rest/auth?code=${code}&state=${state}`,
        {}
      )
    );

    this.setAuthData(response);
  }

  public setAuthData(authTokenData: AuthTokenData): void {
    this.authData = {
      accessTokenExpirationDate: this.processExpDate(authTokenData.expires_in),
      idToken: authTokenData.access_token,
    };
  }

  public getAuthData(): AuthData {
    return this.authData;
  }

  private parseJwt = (token: string): any => {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  };

  getToken = (): any => {
    const auth = this.getAuthData();
    if (auth) {
      return auth.idToken;
    }
    return {};
  };

  getUser() {
    const auth = this.getAuthData();
    if (auth) {
      return this.parseJwt(auth.idToken);
    }
    return {};
  }

  getUsername() {
    const tokenValues = this.getUser();
    return tokenValues.sub;
  }

  getUserEmail() {
    const { mail } = this.getUser();
    return mail;
  }

  getUserInfo() {
    const { first_name, last_name, mail, sub } = this.getUser();
    //handle undefined cases of first name or last name
    const initialsFirstName: string =
      typeof first_name === 'undefined' ? '' : first_name[0];
    const initialsLastName: string =
      typeof last_name === 'undefined' ? '' : last_name[0];
    const firstName = typeof first_name === 'undefined' ? '' : first_name;
    const lastName = typeof last_name === 'undefined' ? '' : last_name;

    return {
      name: `${firstName} ${lastName}`,
      email: mail,
      description: mail,
      picture: `https://avatars.wdf.sap.corp/avatar/${sub}`,
      icon: false,
      initials: initialsFirstName + initialsLastName,
    };
  }

  private processExpDate(expiresInMillis: string): number {
    const expiresIn = Number(expiresInMillis);
    return new Date().getTime() + expiresIn * 1000;
  }
}

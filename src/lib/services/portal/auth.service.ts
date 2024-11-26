import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import {
  AuthData,
  AuthEvent,
  AuthTokenData,
  UserData,
  UserTokenData,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authEventSubject = new Subject<AuthEvent>();
  private authData!: AuthData;

  constructor(private http: HttpClient) {}

  get authEvents(): Observable<AuthEvent> {
    return this.authEventSubject.asObservable();
  }

  public authEvent(event: AuthEvent) {
    this.authEventSubject.next(event);
  }

  public async auth(code: string, state: string) {
    const response = await lastValueFrom(
      this.http.post<AuthTokenData | undefined>(
        `/rest/auth?code=${code}&state=${state}`,
        {}
      )
    );

    this.setAuthData(response);
  }

  public async refresh(): Promise<AuthTokenData | undefined> {
    const response = await lastValueFrom(
      this.http.get<AuthTokenData | undefined>('/rest/auth/refresh')
    );

    this.setAuthData(response);
    return response;
  }

  private setAuthData(authTokenData: AuthTokenData | undefined): void {
    if (!authTokenData) {
      return;
    }

    this.authData = {
      accessTokenExpirationDate: this.processExpDate(authTokenData.expires_in),
      idToken: authTokenData.id_token,
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

  getUser(): UserTokenData {
    const auth = this.getAuthData();
    if (auth) {
      return this.parseJwt(auth.idToken);
    }
    return {} as UserTokenData;
  }

  getUsername() {
    const tokenValues = this.getUser();
    return tokenValues.sub;
  }

  getUserEmail() {
    const { mail } = this.getUser();
    return mail;
  }

  getUserInfo(): UserData {
    const { first_name, last_name, mail } = this.getUser();
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
      picture: '',
      icon: false,
      initials: initialsFirstName + initialsLastName,
    };
  }

  private processExpDate(expiresInSeconds: string): number {
    const expiresIn = Number(expiresInSeconds);
    return new Date().getTime() + expiresIn * 1000;
  }
}

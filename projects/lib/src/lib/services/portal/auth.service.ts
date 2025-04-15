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

  private getUser(): UserTokenData {
    const auth = this.getAuthData();
    if (auth) {
      return this.parseJwt(auth.idToken);
    }
    return {} as UserTokenData;
  }

  getUserInfo(): UserData {
    const user = this.getUser() || ({} as UserTokenData);

    const firstName = user.first_name || user.given_name || '';
    const lastName = user.last_name || user.family_name || '';
    const initialsFirstName: string = firstName[0] || '';
    const initialsLastName: string = lastName[0] || '';

    return {
      name: `${firstName} ${lastName}`,
      email: user.mail || user.email || '',
      description: user.mail || user.email || '',
      picture: '',
      icon: false,
      initials: initialsFirstName + initialsLastName,
      userId: user.sub || '',
    };
  }

  private processExpDate(expiresInSeconds: string): number {
    const expiresIn = Number(expiresInSeconds);
    return new Date().getTime() + expiresIn * 1000;
  }
}

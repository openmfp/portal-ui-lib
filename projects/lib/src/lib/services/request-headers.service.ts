import { LuigiCoreService } from './luigi-core.service';
import { AuthService } from './portal';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RequestHeadersService {
  private luigiCoreService = inject(LuigiCoreService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  public createOptionsWithAuthHeader() {
    let language = this.luigiCoreService.i18n().getCurrentLocale();
    const authData = this.authService.getAuthData();

    this.route.queryParams.subscribe((params) => {
      if (params['language']) {
        language = params['language'];
      }
    });

    const headers = new HttpHeaders({
      'Accept-Language': language || '',
    });

    if (!authData?.idToken) {
      return {
        headers,
      };
    }

    return {
      headers: headers.append('authorization', 'Bearer ' + authData.idToken),
    };
  }
}

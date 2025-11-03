import { LuigiCoreService } from './luigi-core.service';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RequestHeadersService {
  constructor(
    private luigiCoreService: LuigiCoreService,
    private route: ActivatedRoute,
  ) {}

  public createOptionsWithAuthHeader() {
    let language = this.luigiCoreService.i18n().getCurrentLocale();
    const authData = this.luigiCoreService.getAuthData();

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

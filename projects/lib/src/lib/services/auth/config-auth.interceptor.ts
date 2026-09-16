import { AuthService } from '../portal';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

export const configAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/rest/config')) {
    return next(request);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();
  if (token) {
    return next(request);
  }

  return from(authService.refresh()).pipe(
    switchMap(() => {
      const refreshedToken = authService.getToken();
      return next(
        refreshedToken
          ? request.clone({
              setHeaders: { authorization: `Bearer ${refreshedToken}` },
            })
          : request,
      );
    }),
  );
};

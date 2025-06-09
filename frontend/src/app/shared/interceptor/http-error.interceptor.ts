import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { BrioError } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import {
  catchError,
  EMPTY,
  from,
  mergeMap,
  Observable,
  throwError,
} from 'rxjs';
import { IdentityService } from '../security/services/identity.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private identity: IdentityService,
    private messageSvc: MessageService
  ) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (request.responseType === 'blob' && error.error instanceof Blob) {
          
          return from(error.error.text()).pipe(
            mergeMap((blobErrorJson) => {
              const blobError = JSON.parse(JSON.stringify(error)) as any;
              blobError.error = JSON.parse(blobErrorJson);
              const brioError = this.generateError(blobError);
              return throwError(brioError);
            })
          );
        }
        // if ((error.error as BrioError).isBrioError)
        else {
          if (
            (error.status === 401 || error.status === 403) &&
            (!(error.error as BrioError).code || (error.error as BrioError).code==="login") &&
            !this.isPasswordValidationError(error)
          ) {
            if (error.error.type === 'TOKEN_EXPIRED') {
              this.messageSvc.add({
                severity: 'warn',
                summary: 'Session Expired',
                detail: 'Session has expired. Please login again.',
              });
            } 
            else if (error.error.path==="/api/admin/login" || error.error.path==="/api/login"){
              this.messageSvc.add({
                severity: 'error',
                summary: 'Login Failed',
                detail: 'Please key in correct info',
              });
              console.log( error.error.path);
              localStorage.clear();
              this.identity.clear();
          

              return EMPTY;
              
            }
            
            
            else {
              this.messageSvc.add({
                severity: 'error',
                summary: 'Forbidden',
                detail: 'Cannot access this page',
              });
            }
            console.log(error.error.path);
            return this.logout();
          }

          const brioError = this.generateError(error);

          if ((error.status === 401 || error.status === 403) && !this.isPasswordValidationError(error)) {
            return this.logout();
          }

          return throwError(brioError);
        }
        //   else {
        //     // nginx errors or server errors we cannot catch in the gateway because happening before arriving in gateway
        //     if (
        //       error.status === 413 &&
        //       (error.url.includes('storage') || error.url.includes('file'))
        //     ) {
        //       this.messageSvc.add({
        //         severity: 'warn',
        //         summary: 'User Error',
        //         detail: 'File size too big',
        //         sticky: true,
        //       });
        //     }
        //     if (error.status === 415 && error.url.includes('file')) {
        //       this.messageSvc.add({
        //         severity: 'warn',
        //         summary: 'User Error',
        //         detail: 'Invalid file format',
        //         sticky: true,
        //       });
        //     }
        //     return throwError(error.message);
        //   }
      })
    );
  }

  private generateError(error: HttpErrorResponse) {
    const brioError = error.error as BrioError;

    if (error.status === 500) {
      // Critical errors will return a code to give to CS
      // FIXME: the red error in production are disabled for now
      if (environment.API_DOMAIN !== 'api.briohr.com') {
        this.messageSvc.add({
          severity: 'error',
          summary: 'ERRORS.CRITICAL',
          detail: 'ERRORS.CRITICAL_DESC',
          sticky: true,
        });
      } else {
        console.error('Error reference : ' + brioError.id);
      }
    } else {
      let message = brioError.message;
      if (message === 'Bad Request Exception') {
        // FiXME: this is a temporary specific case for class validator or BadRequestException we send in the past without proper message
        message = 'ERRORS.USER_DESC.BADREQUEST';
      }

      // Thib: temporary option to not trigger automatic message when you want to handle manually error from a 400

      if (!error.error?.metadata?.isSilent) {
        console.log(error);
        console.log(location);
        
        // user errors can be resolved by the user so we need to give details to help them fix, or inform what's going on
        this.messageSvc.add({
          key: 'toast',
          severity: 'warn',
          summary: 'ERRORS.USER',
          detail: message,
          // !brioError.code && brioError.type === BrioErrorType.Unhandled
          //   ? message
          //   : 'ERRORS.USER_DESC.' + brioError.code,
          sticky: true,
        });


      if (error.error.path==="/api/admin/login"){
        this.messageSvc.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Wrong User Name or Password',
        });
      }
      if (error.error.path==="/api/login"){
        this.messageSvc.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Wrong User Name or Password',
        });
      }


    }
    }
    return brioError;
  }

  private isPasswordValidationError(error: HttpErrorResponse): boolean {
    return error.status === 403 && 
           error.error?.message === 'Invalid password' &&
           (error.error?.path?.includes('/start-polling') || error.error?.path?.includes('/end-polling'));
  }

  private logout(): Observable<never> {
    console.log( location.pathname);
    localStorage.clear();
    this.identity.clear();

    this.router.navigate(
      ['/signin'],
      location.pathname !== '/signin'
        ? {
            queryParams: { redirect: location.pathname },
            queryParamsHandling: 'merge',
          }
        : {}
    );
    return EMPTY;
  }
}

import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtInterceptor } from '@auth0/angular-jwt';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IdentityService } from '../security/services/identity.service';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
    constructor(
        private jwtInterceptor: JwtInterceptor,
        private identity: IdentityService
    ) {}

    public intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (
            this.jwtInterceptor.isAllowedDomain(req) &&
            !this.jwtInterceptor.isDisallowedRoute(req)
        ) {
            return next.handle(req).pipe(
                map((event: any) => {
                    if (event instanceof HttpResponse && event.status === 202) {
                        // we need to fake an error to be able to catch it
                        throw event as any;
                    }
                    return event as any;
                }),
                catchError((error: any) => {
                    if (error.status === 202) {
                        return this.identity.setup(error.body.token).pipe(
                            switchMap(() => {
                                const newRequest = req.clone({
                                    setHeaders: {
                                        Authorization: `Bearer ${error.body.token}`,
                                    },
                                });
                                return next.handle(newRequest);
                            })
                        );
                    }

                    return throwError(error);
                })
            );
        } else {
            return next.handle(req);
        }
    }
}

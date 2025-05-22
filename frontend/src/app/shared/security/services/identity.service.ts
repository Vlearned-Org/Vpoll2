import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  AdminJwtToken,
  Company,
  JwtToken,
  UserJwtToken,
} from '@vpoll-shared/contract';
import { RoleEnum } from '@vpoll-shared/enum';
import { BehaviorSubject, EMPTY, forkJoin, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  public context$ = new BehaviorSubject<JwtToken<any>>(null);
  public userId$ = new BehaviorSubject<string>(null);
  public company$ = new BehaviorSubject<Company>(null);
  public roles$ = new BehaviorSubject<RoleEnum[]>([]);
  public userName$ = new BehaviorSubject<string>('Hello');

  constructor(
    private router: Router,
    private jwtHelperSvc: JwtHelperService,
    private meHttpSvc: MeHttpService
  ) {}

  public setup(newToken: string = null): Observable<any> {
    if (newToken) {
      localStorage.setItem('access_token', newToken);
    }
    console.log(newToken);
    const token = localStorage.getItem('access_token');
    console.log(token);
    if (!token) {
      return EMPTY;
    }

    if (
      !token.match(/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/)
    ) {
      this.clear();
      localStorage.clear();
      this.router.navigate(['/']);
      return EMPTY;
    }

    const context = this.jwtHelperSvc.decodeToken(token) as JwtToken<any>;
    if (!context || (context && !context.roles)) {
      this.clear();
      localStorage.clear();
      this.router.navigate(['/']);
      return EMPTY;
    }
    console.log(context);

    this.context$.next(context);
    this.roles$.next(context.roles.map((r) => r.role));
    this.userId$.next(context.id);
    this.userName$.next(context.name);

    if (this.isCommonUser) {
      return EMPTY;
    }

    if (this.isSystem) {
      return EMPTY;
    }

    return forkJoin([this.meHttpSvc.company()]).pipe(
      tap(([company]) => {
        this.company$.next(company);
      })
    );
  }

  public clear(): void {
    this.userId$.next(null);
    this.company$.next(null);
    this.roles$.next(null);
  }

  public get userId(): string {
    return this.userId$.value;
  }

  public get isSystem(): boolean {
    return this.roles$.value.includes(RoleEnum.SYSTEM);
  }

  public get isCommonUser(): boolean {
    return !this.context.isAdmin;
  }

  public get isCompanySystem(): boolean {
    return this.roles$.value.includes(RoleEnum.COMPANY_SYSTEM);
  }

  public get roles(): RoleEnum[] {
    return this.roles$.value;
  }

  public get company(): Company {
    return this.company$.value;
  }

  public get context(): UserJwtToken | AdminJwtToken {
    return this.context$.value;
  }

  public get userName(): string {
    return this.userName$.value;
  }

  public hasRole(role: RoleEnum): boolean {
    return this.roles.includes(role);
  }
}

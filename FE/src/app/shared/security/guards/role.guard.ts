import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { RoleEnum } from '@vpoll-shared/enum';
import { IdentityService } from '../services/identity.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private identity: IdentityService, private router: Router) {}

  public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const roles = route.data['roles'] as Array<RoleEnum>;
    if (roles && roles.length > 0) {
      if (roles.find((role) => this.identity.hasRole(role))) {
        return true;
      }
    }

    return this.router.navigate(['/']);
  }
}

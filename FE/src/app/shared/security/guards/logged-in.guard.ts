import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { IdentityService } from '../services/identity.service';

@Injectable({
    providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
    constructor(private router: Router, private identity: IdentityService) {}

    public async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        await this.identity.setup().toPromise();
        if (this.identity.userId) {
            return true;
        } else {
            localStorage.clear();
            this.identity.clear();
            this.router.navigate(['/admin/login'], {
                queryParams: { redirect: state.url },
            });
            return false;
        }
    }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { MenuItem } from 'primeng/api';
import { AppMainComponent } from './app.main.component';
import { IdentityService } from './shared/security/services/identity.service';

import { ShareholderClear } from './store/actions/shareholder.action';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent {
  items: MenuItem[];

  constructor(
    public appMain: AppMainComponent,
    private identity: IdentityService,
    private store: Store,
    private router: Router
  ) {}

  public logout() {
    localStorage.clear();
    this.identity.clear();
    this.store.dispatch(ShareholderClear);
    this.router.navigate(['/']);
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { IdentityService } from '@app/shared/security/services/identity.service';
import { AuthSourceEnum } from '@vpoll-shared/enum';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../api/appconfig';
import { ConfigService } from '../../../mock-service/app.config.service';
import { PublicEvent } from '@vpoll-shared/contract';
@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  valCheck: string[] = ['remember'];

  password: string;

  config: AppConfig;

  subscription: Subscription;
  public upcomingEvents: Array<PublicEvent> = [];
  constructor(
    public configService: ConfigService,
    private fb: FormBuilder,
    private identity: IdentityService,
    private router: Router,
    private auth: AuthHttpService,
    public authHttp: AuthHttpService,
  ) {}

  ngOnInit(): void {
    this.config = this.configService.config;
    this.subscription = this.configService.configUpdate$.subscribe((config) => {
      this.config = config;
    });
    this.form = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
      rememberMe: [false, Validators.required],
      source: [AuthSourceEnum.web, Validators.required],
    });
    this.authHttp.listUpcomingEvent().subscribe((events) => {
      this.upcomingEvents = events;
    });

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  
  goToLink(url: string) {
    console.log(url);
    window.open(url).focus();
  }


  public signin() {
    this.auth.adminLogin(this.form.value).subscribe(async (result) => {
      await this.identity.setup(result.token).toPromise();
      if (this.identity.isSystem) {
        this.router.navigate(['admin/company-list']);
      } else {
        if (this.identity.company) {
          this.router.navigate(['admin/company/profile']);
        }
      }
    });
  }
}

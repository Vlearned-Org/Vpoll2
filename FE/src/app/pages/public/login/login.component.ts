import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { CountryMobileCodes } from '@app/shared/mobile-country-code';
import { IdentityService } from '@app/shared/security/services/identity.service';
import { AuthSourceEnum } from '@vpoll-shared/enum';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../api/appconfig';
import { ConfigService } from '../../../mock-service/app.config.service';
import { PublicEvent } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public countryMobileCode = CountryMobileCodes;
  public selectedCountryMobileCode = this.countryMobileCode[0];

  public form: FormGroup;

  valCheck: string[] = ['remember'];
  password: string;
  config: AppConfig;

  subscription: Subscription;
  public upcomingEvents: Array<PublicEvent> = [];
  constructor(
    public configService: ConfigService,
    public router: Router,
    private fb: FormBuilder,
    private identity: IdentityService,
    private auth: AuthHttpService,
    public authHttp: AuthHttpService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.config = this.configService.config;
    this.subscription = this.configService.configUpdate$.subscribe((config) => {
      this.config = config;
    });
    this.form = this.fb.group({
      mobile: [null, [Validators.required, Validators.pattern('[0-9]{9,10}')]],
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
    window.open(url, '_blank').focus();
  }


  public signin() {

    const { mobile, ...rest } = this.form.value;
    this.auth
      .userLogin({ ...rest, mobile: this.mobile })
      .subscribe(async (result) => {

        await this.identity.setup(result.token).toPromise();
        if (this.identity.isCommonUser) {
          this.router.navigate(['home']);
        }
        else{
          console.log("Oii");
        }
      });
      
  }

  public get mobile() {
    return `${this.selectedCountryMobileCode.name}${this.form.value.mobile}`.replace(
      /\D/g,
      ''
    );
  }
}

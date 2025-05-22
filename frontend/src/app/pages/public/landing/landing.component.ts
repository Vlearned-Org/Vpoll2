import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { AuthSourceEnum } from '@vpoll-shared/enum';
import { IdentityService } from '@app/shared/security/services/identity.service';
import { PublicEvent } from '@vpoll-shared/contract';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../api/appconfig';
import { ConfigService } from '../../../mock-service/app.config.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { CountryMobileCodes } from '@app/shared/mobile-country-code';
import { EnquiryModal } from '@app/modals/enquiry/enquiry.modal';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],

  
})
export class LandingComponent implements OnInit, OnDestroy {
  public countryMobileCode = CountryMobileCodes;
  public selectedCountryMobileCode = this.countryMobileCode[0];


  public form: FormGroup;
  public formmobile: FormGroup;
  config: AppConfig;
  subscription: Subscription;
  public upcomingEvents: Array<PublicEvent> = [];

  constructor(
    public configService: ConfigService,
    public router: Router,
    public renderer: Renderer2,
    public authHttp: AuthHttpService,


    private fb: FormBuilder,
    private identity: IdentityService,
    private auth: AuthHttpService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.config = this.configService.config;
    this.subscription = this.configService.configUpdate$.subscribe((config) => {
      this.config = config;
    });
    this.authHttp.listUpcomingEvent().subscribe((events) => {
      this.upcomingEvents = events;
    });
    this.form = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
      rememberMe: [false, Validators.required],
      source: [AuthSourceEnum.web, Validators.required],
    });
    this.formmobile = this.fb.group({
      mobile: [null, [Validators.required, Validators.pattern('[0-9]{9,10}')]],
      password: [null, Validators.required],
      rememberMe: [false, Validators.required],
      source: [AuthSourceEnum.web, Validators.required],
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

  public usersignin() {
    
    const { mobile, ...rest } = this.formmobile.value;
    this.auth
      .userLogin({ ...rest, mobile: this.mobile })
      .subscribe(async (result) => {
        console.log(result);
        await this.identity.setup(result.token).toPromise();
        if (this.identity.isCommonUser) {
          this.router.navigate(['home']);
        }
      });
      
      
  }

  public get mobile() {
    return `${this.selectedCountryMobileCode.name}${this.formmobile.value.mobile}`.replace(
      /\D/g,
      ''
    );
  }

  public enquiry() {
    const dialogRef = this.dialogService.open(EnquiryModal, {
      header: 'Enquiry us Now!',
      width: '40%',
    });
    dialogRef.onClose.subscribe((company) => {
      this.ngOnInit();
    });
  }

}

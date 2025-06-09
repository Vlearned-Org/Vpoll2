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
import { ConsentRecord } from '@app/shared/components/consent-form/consent-form.component';
import { MessageService } from 'primeng/api';
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
  public consentGiven = false;
  public consentRecords: ConsentRecord[] = [];
  public loading = false;
  
  constructor(
    public configService: ConfigService,
    private fb: FormBuilder,
    private identity: IdentityService,
    private router: Router,
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
    // Mark all fields as touched to trigger validation display
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (!this.consentGiven) {
      this.messageService.add({
        severity: 'error',
        summary: 'Consent Required',
        detail: 'You must provide consent to data processing before logging in'
      });
      return;
    }

    this.loading = true;
    
    this.auth.adminLogin(this.form.value).subscribe(
      async (result) => {
        try {
          await this.identity.setup(result.token).toPromise();
          this.loading = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: 'Welcome back, Administrator!'
          });
          
          if (this.identity.isSystem) {
            this.router.navigate(['admin/company-list']);
          } else {
            if (this.identity.company) {
              this.router.navigate(['admin/company/profile']);
            }
          }
        } catch (setupError) {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Login Error',
            detail: 'Failed to initialize admin session'
          });
        }
      },
      (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error.error?.message || 'Invalid credentials'
        });
      }
    );
  }

  public onConsentChange(consentData: {valid: boolean, consents: ConsentRecord[]}): void {
    this.consentGiven = consentData.valid;
    this.consentRecords = consentData.consents;
  }

  public get isLoginValid(): boolean {
    return this.form.valid && this.consentGiven;
  }
}

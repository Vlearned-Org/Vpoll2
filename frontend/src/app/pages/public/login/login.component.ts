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
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
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
      email: [null, [Validators.required, this.emailOrNricValidator]],
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
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a valid email address or NRIC'
      });
      return;
    }

    const { email, password, rememberMe, source } = this.form.value;
    this.auth
      .userLogin({ email, password, rememberMe, source })
      .subscribe(
        async (result) => {
          await this.identity.setup(result.token).toPromise();
          if (this.identity.isCommonUser) {
            this.router.navigate(['home']);
          }
          else{
            console.log("Oii");
          }
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error.message || 'Invalid email/NRIC or password'
          });
        }
      );
  }

  // Custom validator for email or NRIC
  private emailOrNricValidator(control: any) {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const value = control.value.trim();
    
    // Check if it's a valid email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(value)) {
      return null; // Valid email
    }

    // Check if it's a valid NRIC (alphanumeric, 8-12 characters)
    const nricRegex = /^[a-zA-Z0-9]{8,12}$/;
    if (nricRegex.test(value)) {
      return null; // Valid NRIC format
    }

    // Neither valid email nor NRIC
    return { emailOrNric: true };
  }
}

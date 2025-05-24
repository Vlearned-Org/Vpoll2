import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { Message, MessageService } from 'primeng/api';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  public messages: Message[] = [];
  public email: string = '';
  public emailSent: boolean = false;

  constructor(
    public router: Router,
    private auth: AuthHttpService,
    private fb: FormBuilder,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.emailSent = false;
  }

  public requestPasswordResetLink(): void {
            this.messages = [];
    if (!this.email) {
      this.messages.push({ severity: 'warn', summary: 'Validation', detail: 'Email address is required.' });
      return;
  }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
        this.messages.push({ severity: 'error', summary: 'Invalid Email', detail: 'Please enter a valid email address.' });
        return;
  }

    this.auth.userForgetPassword({ email: this.email }).subscribe(
      (response) => {
        this.emailSent = true;
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Request Sent',
          detail: 'If an account exists for this email, a password reset link has been sent.',
        });
      },
      (err) => {
        this.emailSent = false;
        this.messages.push({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to send password reset email. Please try again.',
        });
      }
    );
  }
}

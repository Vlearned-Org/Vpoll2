import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHttpService } from '@app/shared/http-services/auth-http.service';
import { IdentityService } from '@app/shared/security/services/identity.service';
import { MessageService } from 'primeng/api';

// Custom validator for password match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  tokenNotFound = false;
  resetSuccess = false;
  submitting = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authHttpService: AuthHttpService,
    private identityService: IdentityService,
    private messageService: MessageService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]], // Add any other password policies you have
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.tokenNotFound = true;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Reset token not found in URL.' });
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      this.errorMessage = 'Please correct the errors in the form.';
      if (!this.token) {
          this.errorMessage = 'Reset token is missing. Cannot proceed.';
      }
      Object.values(this.resetForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const { password, confirmPassword } = this.resetForm.value;

    this.authHttpService.userResetPassword({ token: this.token, password, confirmPassword })
      .subscribe(
        async (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password has been reset successfully!' });
          this.resetSuccess = true;
          // Optionally, log the user in directly
          // await this.identityService.setup(response.token).toPromise();
          // this.router.navigate(['/home']); 
          this.submitting = false;
        },
        (error) => {
          this.errorMessage = error.error?.message || 'An error occurred while resetting your password. The token might be invalid or expired.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.errorMessage });
          this.submitting = false;
        }
      );
  }
} 
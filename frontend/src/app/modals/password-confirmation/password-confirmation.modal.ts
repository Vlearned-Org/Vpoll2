import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-password-confirmation-modal',
  templateUrl: './password-confirmation.modal.html',
  styleUrls: ['./password-confirmation.modal.scss'],
})
export class PasswordConfirmationModal implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public action: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.action = this.config.data?.action || 'perform this action';
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  public confirm(): void {
    this.submitted = true;
    
    if (this.form.invalid) {
      return;
    }

    const password = this.form.get('password')?.value;
    if (!password || password.trim().length === 0) {
      this.messageSvc.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter your password'
      });
      return;
    }

    this.dialogRef.close(password);
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public get passwordControl() {
    return this.form.get('password');
  }
}
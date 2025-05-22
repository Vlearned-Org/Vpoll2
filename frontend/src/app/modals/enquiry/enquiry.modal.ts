import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemEnquiryHttpService } from '@app/shared/http-services/enquiry-http.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.modal.html',
  styleUrls: ['./enquiry.modal.scss'],
})
export class EnquiryModal implements OnInit {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageSvc: MessageService,
    private dialogRef: DynamicDialogRef,
    private enquiryHttpSvc: SystemEnquiryHttpService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  public submitEnquiry() {
    this.enquiryHttpSvc.sendEnquiry(this.form.value).subscribe((enquiry) => {
      console.log(this.form.value);
      this.messageSvc.add({
        key: 'toast',
        severity: 'success',
        summary: `Enquiry ${enquiry.subject} sent successfully.`,
        detail: 'Success',
      });
      this.dialogRef.close();
    },
    
    
    (error) => {
      console.error("Failed to send enquiry:", error);
      this.messageSvc.add({
        key: 'toast',
        severity: 'error',
        summary: 'Failed to send enquiry',
        detail: 'Error',
      });
    });
  }
}

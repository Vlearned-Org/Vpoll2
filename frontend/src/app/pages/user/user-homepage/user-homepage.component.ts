import { Component, OnInit } from '@angular/core';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import {
  AccountVerificationStatusEnum,
  InternalFile,
  RichInternalFile,
} from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.scss'],
})
export class UserHomepageComponent implements OnInit {
  public identity: string;
  public identityDocument: InternalFile;
  public email: string;
  public fullname: string;
  public status: AccountVerificationStatusEnum;
  public rejectMessage: string;
  public AccountVerificationStatusEnum = AccountVerificationStatusEnum;

  public get isNricVerified(): boolean {
    return this.status === AccountVerificationStatusEnum.APPROVED;
  }

  constructor(private me: MeHttpService, private messageSvc: MessageService) {}

  ngOnInit(): void {
    this.me.getMe().subscribe((user) => {
      this.status = user.accountVerificationStatus;
      this.identity = user.nric;
      this.email = user.email?.toUpperCase();
      this.fullname = user.name?.toUpperCase();
      this.identityDocument = user.nricRef;
      this.rejectMessage = user.rejectMessage;
    });

    
  }

  public identityOnChange(event) {
    // regex expression to match all
    // non-alphanumeric characters in string

    const regex = /[^A-Z0-9]/gi;
    this.identity = this.identity.replace(regex, '').toLowerCase();
  }

  public emailOnChange(event) {
    this.email = this.email.toUpperCase();
  }

  public fullnameOnChange(event) {
    this.fullname = this.fullname.toUpperCase();
  }

  public addForm(file: RichInternalFile) {
    this.identityDocument = file;
  }

  public removeFormAttachment() {
    this.identityDocument = null;
  }

  public isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}

public isNumericString(value: string): boolean {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(value);
}

  public submitForVerification() {
    if (!this.identityDocument || !this.identityDocument._id) {
      this.messageSvc.add({
        key: 'toast',
        severity: 'error',
        detail: 'NRIC/Passport document is required for verification.',
      });
      return; 
    }

    if (this.isValidEmail(this.email) && this.isNumericString(this.identity)){
      this.me
      .updatePersonalInfo({
        identity: this.identity,
        identityDocument: this.identityDocument._id,
        email: this.email.toLowerCase(),
        name:this.fullname.toUpperCase(),
        
      })
      .subscribe((user) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          detail: `Successfully submitted for verification`,
        });
        this.ngOnInit();
      });}

      else{
        if (!this.isValidEmail(this.email)){
        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          detail: `Wrong Email Format`,
        });
        
      }
      else if(!this.isNumericString(this.identity)){

        this.messageSvc.add({
          key: 'toast',
          severity: 'error',
          detail: `Wrong NRIC/Passport Format`,
        });
      }



      }



  }
}

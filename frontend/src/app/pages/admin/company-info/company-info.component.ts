import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { IdentityService } from '@app/shared/security/services/identity.service';
import { Company, RichInternalFile } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
})
export class CompanyInfoComponent implements OnInit {
  public loading = false;
  public company: Company;
  public companyInfo: FormGroup;
  public photoUrl: string;

  constructor(
    private fb: FormBuilder,
    private identity: IdentityService,
    private meHttpSvc: MeHttpService,
    private messageSvc: MessageService
  ) {}

  public ngOnInit(): void {
    this.company = this.identity.company;
    this.photoUrl = this.company.information.logo as string;
    this.companyInfo = this.fb.group({
      registrationNumber: [],
      email: [],
      phone: [],
      logo: [],
      address: this.fb.group({
        line1: [],
        line2: [],
        country: [],
        countryZone: [],
        zip: [],
        city: [],
      }),
    });
    this.companyInfo.patchValue(this.company.information);
    this.loading = false;
  }

  public updateCompanyInfo() {
    this.meHttpSvc
      .updateCompanyInformation(this.companyInfo.value)
      .subscribe(async (company) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          summary: 'Success',
          detail: 'Company Profile Updated',
        });
        await this.identity.setup().toPromise();
        this.company = this.identity.company;
        this.companyInfo.patchValue(this.company.information);
      });
  }

  public addPhoto(file: RichInternalFile) {
    this.companyInfo.get('logo').patchValue(file._id);
    this.photoUrl = file._id;
  }

  public removePhoto(photoUrl) {
    this.companyInfo.get('logo').patchValue(null);
    this.photoUrl = null;
  }
}

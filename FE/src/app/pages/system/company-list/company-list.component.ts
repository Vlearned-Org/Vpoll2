import { Component, OnInit } from '@angular/core';
import { CreateCompanyModal } from '@app/modals/create-company/create-company.modal';
import { SystemCompanyHttpService } from '@app/shared/http-services/system-company-http.service';
import { Company, User } from '@vpoll-shared/contract';
import { CompanyStatusEnum } from '@vpoll-shared/enum';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
})
export class CompanyListComponent implements OnInit {
  public loading = true;
  public companies: Array<{ company: Company; systemUser: User }>;
  public CompanyStatusEnum = CompanyStatusEnum;

  constructor(
    private companyHttpSvc: SystemCompanyHttpService,
    private dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    this.companyHttpSvc.listCompanies().subscribe((companies) => {
      this.companies = companies;
      this.loading = false;
    });
  }

  public createCompany() {
    const dialogRef = this.dialogService.open(CreateCompanyModal, {
      header: 'Create Company',
      width: '40%',
    });
    dialogRef.onClose.subscribe((company) => {
      this.ngOnInit();
    });
  }

  public deactivateCompany(company: Company) {
    this.companyHttpSvc.deactivateCompany(company._id).subscribe((company) => {
      this.ngOnInit();
    });
  }

  public activateCompany(company: Company) {
    this.companyHttpSvc.activateCompany(company._id).subscribe((company) => {
      this.ngOnInit();
    });
  }
}

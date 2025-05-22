import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  Company,
  CreateCompanyData,
  UpdateCompanyAdminData,
  User,
} from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemCompanyHttpService {
  constructor(private http: HttpClient) {}

  public listCompanies(): Observable<
    Array<{ company: Company; systemUser: User }>
  > {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Array<{ company: Company; systemUser: User }>>(
      `${environment.API_URL}/companies`,
      { headers: headers }
    );
  }

  public getCompanyById(id: string): Observable<Company> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Company>(`${environment.API_URL}/companies/${id}`, {
      headers: headers,
    });
  }

  public createCompany(company: CreateCompanyData): Observable<Company> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Company>(
      `${environment.API_URL}/companies`,
      company,
      { headers: headers }
    );
  }

  public updateCompanyAdmin(
    companyId: string,
    payload: UpdateCompanyAdminData
  ): Observable<Company> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Company>(
      `${environment.API_URL}/companies/${companyId}/update-company-admin`,
      payload,
      { headers: headers }
    );
  }

  public activateCompany(companyId: string): Observable<Company> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Company>(
      `${environment.API_URL}/companies/${companyId}/activate`,
      {},
      { headers: headers }
    );
  }

  public deactivateCompany(companyId: string): Observable<Company> {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });

    return this.http.patch<Company>(
      `${environment.API_URL}/companies/${companyId}/deactivate`,
      {},
      { headers: headers }
    );
  }
}

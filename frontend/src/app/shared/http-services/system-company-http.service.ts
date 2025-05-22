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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public listCompanies(): Observable<
    Array<{ company: Company; systemUser: User }>
  > {
    const headers = this.getAuthHeaders();
    return this.http.get<Array<{ company: Company; systemUser: User }>>(
      `${environment.API_URL}/companies`, 
      { headers }
    );
  }

  public getCompanyById(id: string): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.get<Company>(
      `${environment.API_URL}/companies/${id}`, 
      { headers }
    );
  }

  public createCompany(company: CreateCompanyData): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.post<Company>(
      `${environment.API_URL}/companies`, 
      company, 
      { headers }
    );
  }

  public updateCompanyAdmin(
    companyId: string,
    payload: UpdateCompanyAdminData
  ): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Company>(
      `${environment.API_URL}/companies/${companyId}/update-company-admin`,
      payload, 
      { headers }
    );
  }

  public activateCompany(companyId: string): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Company>(
      `${environment.API_URL}/companies/${companyId}/activate`,
      {}, 
      { headers }
    );
  }

  public deactivateCompany(companyId: string): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Company>(
      `${environment.API_URL}/companies/${companyId}/deactivate`,
      {}, 
      { headers }
    );
  }
}


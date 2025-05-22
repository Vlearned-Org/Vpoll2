import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateCompanyAdminDto, User } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyHttpService {
  constructor(private http: HttpClient) {}

  public getCompanyAdmins(): Observable<User[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<User[]>(`${environment.API_URL}/company/admin`,{ headers: headers },);
  }

  public createCompanyAdmin(payload: CreateCompanyAdminDto): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<User>(
      `${environment.API_URL}/company/admin`,
      payload
      ,{ headers: headers },);
  }
}

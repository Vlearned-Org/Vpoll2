import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { User } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserHttpService {
  constructor(private http: HttpClient) {}

  public listUsers(): Observable<User[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<User[]>(`${environment.API_URL}/users`,{ headers: headers });
  }

  public getUserById(id: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<User>(`${environment.API_URL}/users/${id}`,{ headers: headers });
  }

  public approveUser(id: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<User>(
      `${environment.API_URL}/users/${id}/approve`
      ,{ headers: headers }
    );
  }

  public rejectUser(id: string, reason: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<User>(`${environment.API_URL}/users/${id}/reject`,{ headers: headers });
  }
}

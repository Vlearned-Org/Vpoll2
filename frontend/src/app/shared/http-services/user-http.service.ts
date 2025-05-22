import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<User[]>(`${environment.API_URL}/users`, { headers });
  }

  public getUserById(id: string): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<User>(`${environment.API_URL}/users/${id}`, { headers });
  }

  public approveUser(id: string): Observable<User> {
    // Debug logging
    const token = localStorage.getItem('access_token');
    console.log('Token:', token);
    console.log('User ID to approve:', id);
    
    // Create headers with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.patch<User>(
      `${environment.API_URL}/users/${id}/approve`,
      {},
      { headers }
    );
  }

  public rejectUser(id: string, reason: string): Observable<User> {
    // Apply the same pattern for consistency
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.patch<User>(
      `${environment.API_URL}/users/${id}/reject`,
      { reason },
      { headers }
    );
  }
}


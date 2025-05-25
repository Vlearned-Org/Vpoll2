import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { User } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

export interface CreateLegacyUserDto {
  name: string;
  nric: string;
  password: string;
  email?: string;
  mobile?: string;
  fallbackContactName?: string;
  fallbackContactPhone?: string;
  fallbackContactEmail?: string;
  fallbackContactRelation?: string;
  physicalAddress?: string;
  requiresAssistedAccess?: boolean;
  specialInstructions?: string;
  isAdmin: boolean;
  status: string;
  accountVerificationStatus: string;
}

export interface AccessCodeResponse {
  accessCode: string;
  expiresAt: string;
}

export interface PasswordResetResponse {
  newPassword: string;
}

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

  public getLegacyUsers(): Observable<User[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<User[]>(`${environment.API_URL}/admin/legacy-users`, { headers });
  }

  public createLegacyUser(userData: CreateLegacyUserDto): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.post<User>(`${environment.API_URL}/admin/legacy-users`, userData, { headers });
  }

  public updateLegacyUser(userId: string, userData: Partial<CreateLegacyUserDto>): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<User>(`${environment.API_URL}/users/${userId}`, userData, { headers });
  }

  public createWalkInUser(userData: {
    name: string;
    nric: string;
    visitLocation: string;
    assistedBy?: string;
    adminNotes?: string;
    email?: string;
    mobile?: string;
  }): Observable<{ user: User; temporaryPassword: string; message: string }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{ user: User; temporaryPassword: string; message: string }>(
      `${environment.API_URL}/users/walk-in/create`, 
      userData, 
      { headers }
    );
  }

  public getWalkInStats(): Observable<{
    totalWalkInUsers: number;
    monthlyWalkIns: number;
    recentWalkIns: User[];
  }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{
      totalWalkInUsers: number;
      monthlyWalkIns: number;
      recentWalkIns: User[];
    }>(`${environment.API_URL}/users/walk-in/stats`, { headers });
  }

  public resetUserPassword(userId: string): Observable<PasswordResetResponse> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<PasswordResetResponse>(`${environment.API_URL}/admin/legacy-users/${userId}/reset-password`, {}, { headers });
  }

  public generateAccessCode(userId: string): Observable<AccessCodeResponse> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<AccessCodeResponse>(`${environment.API_URL}/admin/legacy-users/${userId}/access-code`, {}, { headers });
  }

  public sendFallbackNotification(userId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<any>(`${environment.API_URL}/admin/legacy-users/${userId}/notify-fallback`, {}, { headers });
  }

  public markAsLegacyUser(userId: string): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<User>(`${environment.API_URL}/admin/legacy-users/${userId}/mark-as-legacy`, {}, { headers });
  }

  public unmarkLegacyUser(userId: string): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<User>(`${environment.API_URL}/admin/legacy-users/${userId}/unmark-legacy`, {}, { headers });
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


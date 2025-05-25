import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LegacyUserRequest {
  _id: string;
  name: string;
  nric: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  contactPersonRelation?: string;
  physicalAddress?: string;
  preferredContactMethod: 'phone' | 'email' | 'postal';
  requestType: 'new_account' | 'password_reset' | 'access_help' | 'other';
  message: string;
  eventName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
  createdUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processed: number;
}

export interface ApproveRequestDto {
  adminNotes?: string;
  createUser?: boolean;
  userData?: {
    password?: string;
    email?: string;
    mobile?: string;
  };
}

export interface RejectRequestDto {
  rejectionReason: string;
  adminNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LegacyUserRequestHttpService {
  private readonly baseUrl = `${environment.API_URL}/admin/legacy-user-requests`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  public getAllRequests(status?: string): Observable<LegacyUserRequest[]> {
    const params = status ? { status } : {};
    return this.http.get<LegacyUserRequest[]>(this.baseUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  public getRequestStats(): Observable<RequestStats> {
    return this.http.get<RequestStats>(`${this.baseUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  public getPendingRequests(): Observable<LegacyUserRequest[]> {
    return this.http.get<LegacyUserRequest[]>(`${this.baseUrl}/pending`, {
      headers: this.getHeaders()
    });
  }

  public getRequestById(id: string): Observable<LegacyUserRequest> {
    return this.http.get<LegacyUserRequest>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  public approveRequest(id: string, data: ApproveRequestDto): Observable<LegacyUserRequest> {
    return this.http.post<LegacyUserRequest>(`${this.baseUrl}/${id}/approve`, data, {
      headers: this.getHeaders()
    });
  }

  public rejectRequest(id: string, data: RejectRequestDto): Observable<LegacyUserRequest> {
    return this.http.post<LegacyUserRequest>(`${this.baseUrl}/${id}/reject`, data, {
      headers: this.getHeaders()
    });
  }

  public updateAdminNotes(id: string, adminNotes: string): Observable<LegacyUserRequest> {
    return this.http.patch<LegacyUserRequest>(`${this.baseUrl}/${id}/notes`, 
      { adminNotes }, 
      { headers: this.getHeaders() }
    );
  }

  public deleteRequest(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
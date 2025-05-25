import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  AdminLoginDto,
  EmailValidationDto,
  EmailValidationResponse,
  LoginResponse,
  PublicEvent,
  RequestResetPasswordWithEmailDto,
  RequestResetPasswordWithEmailResponse,
  ResetPasswordDto,
  User,
  UserLoginDto,
  UserSignUpDto,
} from '@vpoll-shared/contract';

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LegacyUserRequestDto {
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
}

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  constructor(private http: HttpClient) {}

  public adminLogin(payload: AdminLoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/admin/login`,
      payload
    );
  }

  public adminForgetPassword(
    payload: RequestResetPasswordWithEmailDto
  ): Observable<RequestResetPasswordWithEmailResponse> {
    return this.http.post<RequestResetPasswordWithEmailResponse>(
      `${environment.API_URL}/admin/request-password`,
      payload
    );
  }

  public adminResetPassword(
    payload: ResetPasswordDto
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/admin/reset-password`,
      payload
    );
  }

  // User
  public listUpcomingEvent(): Observable<Array<PublicEvent>> {
    return this.http.get<any>(`${environment.API_URL}/upcoming-events`);
  }

  public userLogin(payload: UserLoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/login`,
      payload
    );
  }

  public refreshuser(payload: User): Observable<LoginResponse> {
    console.log(payload);
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/refreshtoken`,
      payload 
    );
  }

  public emailOtpValidation(
    payload: EmailValidationDto 
  ): Observable<EmailValidationResponse> {
    return this.http.post<EmailValidationResponse>(
      `${environment.API_URL}/email-validation`,
      payload
    );
  }

  public userSignUp(payload: UserSignUpDto): Observable<User> {
    return this.http.post<User>(`${environment.API_URL}/signup`, payload);
  }

  public userForgetPassword(
    payload: RequestResetPasswordWithEmailDto 
  ): Observable<RequestResetPasswordWithEmailResponse> {
    return this.http.post<RequestResetPasswordWithEmailResponse>(
      `${environment.API_URL}/request-change-password`,
      payload
    );
  }

  public userResetPassword(
    payload: ResetPasswordDto
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.API_URL}/reset-password`,
      payload
    );
  }

  public changePassword(payload: ChangePasswordDto): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
    });
    return this.http.post<any>(
      `${environment.API_URL}/me/change-password`,
      payload,
      { headers: headers }
    );
  }

  public submitLegacyUserRequest(payload: LegacyUserRequestDto): Observable<any> {
    return this.http.post<any>(
      `${environment.API_URL}/legacy-user-request`,
      payload
    );
  }
}

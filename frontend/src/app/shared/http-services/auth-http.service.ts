import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  AdminLoginDto,
  LoginResponse,
  MobileValidationDto,
  MobileValidationResponse,
  PublicEvent,
  RequestResetPasswordWithEmailDto,
  RequestResetPasswordWithEmailResponse,
  RequestResetPasswordWithMobileDto,
  RequestResetPasswordWithMobileResponse,
  ResetPasswordDto,
  User,
  UserLoginDto,
  UserSignUpDto,
} from '@vpoll-shared/contract';
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

  public mobileOtpValidation(
    payload: MobileValidationDto
  ): Observable<MobileValidationResponse> {
    return this.http.post<MobileValidationResponse>(
      `${environment.API_URL}/otp-validation`,
      payload
    );
  }

  public userSignUp(payload: UserSignUpDto): Observable<User> {
    return this.http.post<User>(`${environment.API_URL}/signup`, payload);
  }

  public userForgetPassword(
    payload: RequestResetPasswordWithMobileDto
  ): Observable<RequestResetPasswordWithMobileResponse> {
    return this.http.post<any>(
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
}

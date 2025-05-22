import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  CreateEnquiry,
  Enquiry,
} from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemEnquiryHttpService {
  constructor(private http: HttpClient) {}

  public sendEnquiry(enquiry: CreateEnquiry): Observable<Enquiry> {
    return this.http.post<Enquiry>(`${environment.API_URL}/enquiries`, enquiry);
  }


}

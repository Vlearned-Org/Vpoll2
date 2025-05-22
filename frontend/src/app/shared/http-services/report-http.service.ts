import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportHttpService {
  constructor(private http: HttpClient) {}

  public generateQuestionReport(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(`${environment.API_URL}/reports/question`, {
      params: {
        eventId,
      },
      responseType: 'blob',
    });
  }

  public generateAttendanceReport(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(`${environment.API_URL}/reports/attendance`, {
      params: {
        eventId,
      },
      responseType: 'blob',
      headers: headers
    });
  }

  public generateQuorumReport(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(`${environment.API_URL}/reports/quorum`, {
      params: {
        eventId,
      },
      responseType: 'blob',
      headers: headers
    });
  }

  public generateProxyVotingReport(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(`${environment.API_URL}/reports/proxy-voting`, {
      params: {
        eventId,
      },
      responseType: 'blob',
      headers: headers
    });
  }

  public generateProxyConsolidatedReport(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(`${environment.API_URL}/reports/proxy-consolidated`, {
      params: {
        eventId,
      },
      responseType: 'blob',
      headers: headers
    });
  }

  public generateFinalPollingResult(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(`${environment.API_URL}/reports/voting`, {
      params: {
        eventId,
      },
      responseType: 'blob',
      headers: headers
    });
  }
}

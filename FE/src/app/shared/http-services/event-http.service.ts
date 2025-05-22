import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  AuditContract,
  AuditTypes,
  Event,
  QuestionAuditDataContract,
  ResolutionVotingResult,
} from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventHttpService {
  constructor(private http: HttpClient) {}

  public listEvents(): Observable<Event[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Event[]>(`${environment.API_URL}/events`,{ headers: headers });
  }

  public getEvent(eventId: string): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Event>(`${environment.API_URL}/events/${eventId}`,{ headers: headers });
  }

  public getEventAuditLogs(
    eventId: string
  ): Observable<AuditContract<AuditTypes>[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<AuditContract<AuditTypes>[]>(
      `${environment.API_URL}/events/${eventId}/audit-logs`
      ,{ headers: headers });
  }

  public getEventQuestions(
    eventId: string
  ): Observable<AuditContract<QuestionAuditDataContract>[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<AuditContract<QuestionAuditDataContract>[]>(
      `${environment.API_URL}/events/${eventId}/audit-logs/questions`
      ,{ headers: headers });
  }

  public getEventVotingResult(
    eventId: string
  ): Observable<ResolutionVotingResult[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<ResolutionVotingResult[]>(
      `${environment.API_URL}/events/${eventId}/voting-result`
      ,{ headers: headers });
  }

  public createEvent(event: Event): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Event>(`${environment.API_URL}/events`, event,{ headers: headers });
  }

  public updateEvent(
    eventId: string,
    event: Partial<Event>
  ): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}`,
      event
      ,{ headers: headers });
  }

  public startEventPolling(eventId: string): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}/start-polling`,
      null
      ,{ headers: headers });
  }

  public endEventPolling(eventId: string): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}/end-polling`,
      null
      ,{ headers: headers });
  }

  public publishEventPolling(eventId: string): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}/publish-polling`,
      null
      ,{ headers: headers });
  }

  public deleteEvent(eventId: string): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.delete<Event>(`${environment.API_URL}/events/${eventId}`,{ headers: headers });
  }
}

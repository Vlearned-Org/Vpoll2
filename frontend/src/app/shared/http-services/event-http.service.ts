import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public listEvents(): Observable<Event[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Event[]>(
      `${environment.API_URL}/events`, 
      { headers }
    );
  }

  public getEvent(eventId: string): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.get<Event>(
      `${environment.API_URL}/events/${eventId}`, 
      { headers }
    );
  }

  public getEventAuditLogs(
    eventId: string
  ): Observable<AuditContract<AuditTypes>[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<AuditContract<AuditTypes>[]>(
      `${environment.API_URL}/events/${eventId}/audit-logs`,
      { headers }
    );
  }

  public getEventQuestions(
    eventId: string
  ): Observable<AuditContract<QuestionAuditDataContract>[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<AuditContract<QuestionAuditDataContract>[]>(
      `${environment.API_URL}/events/${eventId}/audit-logs/questions`,
      { headers }
    );
  }

  public getEventVotingResult(
    eventId: string
  ): Observable<ResolutionVotingResult[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ResolutionVotingResult[]>(
      `${environment.API_URL}/events/${eventId}/voting-result`,
      { headers }
    );
  }

  public createEvent(event: Event): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.post<Event>(
      `${environment.API_URL}/events`, 
      event, 
      { headers }
    );
  }

  public updateEvent(
    eventId: string,
    event: Partial<Event>
  ): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}`,
      event,
      { headers }
    );
  }

  public startEventPolling(eventId: string, password: string): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}/start-polling`,
      { password },
      { headers }
    );
  }

  public endEventPolling(eventId: string, password: string): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}/end-polling`,
      { password },
      { headers }
    );
  }

  public publishEventPolling(eventId: string): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Event>(
      `${environment.API_URL}/events/${eventId}/publish-polling`,
      {}, // Empty object instead of null
      { headers }
    );
  }

  public deleteEvent(eventId: string): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.delete<Event>(
      `${environment.API_URL}/events/${eventId}`,
      { headers }
    );
  }
}


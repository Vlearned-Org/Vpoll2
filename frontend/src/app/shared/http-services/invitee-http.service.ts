import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { AddInvitee, Invitee } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InviteeHttpService {
  constructor(private http: HttpClient) {}

  public listInvitees(eventId: string): Observable<Invitee[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Invitee[]>(`${environment.API_URL}/invitees`, {
      params: { eventId },headers: headers
    });
  }

  public getInvitee(eventId: string, inviteeId: string): Observable<Invitee> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Invitee>(
      `${environment.API_URL}/invitees/${inviteeId}`,
      { params: { eventId },headers: headers }
    );
  }

  public addInvitee(eventId: string, invitee: AddInvitee): Observable<Invitee> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Invitee>(`${environment.API_URL}/invitees`, invitee, {
      params: { eventId },headers: headers
    });
  }

  public updateInvitee(
    eventId: string,
    inviteeId: string,
    invitee: AddInvitee
  ): Observable<Invitee> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Invitee>(
      `${environment.API_URL}/invitees/${inviteeId}`,
      invitee,
      {
        params: { eventId },headers: headers
      }
    );
  }
}

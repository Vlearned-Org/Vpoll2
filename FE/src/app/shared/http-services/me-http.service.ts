import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  AskQuestionData,
  Company,
  CompanyInfo,
  Event,
  ResolutionVotingEntry,
  ResolutionVotingResult,
  User,
  UserEvent,
  UserVerificationDto,
  Voting,
  VotingData,
} from '@vpoll-shared/contract';
import { RoleEnum } from '@vpoll-shared/enum';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeHttpService {
  constructor(private http: HttpClient) {}

  public getMe(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<User>(`${environment.API_URL}/me`,{ headers: headers });
  }

  public updatePersonalInfo(data: UserVerificationDto): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<User>(
      `${environment.API_URL}/me/verfication-info`,
      data,
      { headers: headers }
    );
  }

  public company(): Observable<Company> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Company>(`${environment.API_URL}/me/company`,{ headers: headers });
  }

  public updateCompanyInformation(
    companyInformation: CompanyInfo
  ): Observable<Company> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Company>(
      `${environment.API_URL}/me/company/information`,
      companyInformation
      ,{ headers: headers });
  }

  public roles(): Observable<RoleEnum[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<RoleEnum[]>(`${environment.API_URL}/me/roles`,{ headers: headers });
  }

  public events(random?: number): Observable<Event[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Event[]>(`${environment.API_URL}/me/events`,{ headers: headers });
  }

  public eventById(eventId: string): Observable<UserEvent> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<UserEvent>(
      `${environment.API_URL}/me/events/${eventId}`,{ headers: headers }
    );
  }

  public leanEventById(eventId: string): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Event>(
      `${environment.API_URL}/me/events/${eventId}/lean`,{ headers: headers }
    );
  }

  public zegoToken(eventId): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<any>(
      `${environment.API_URL}/me/events/${eventId}/zego-token`,{ headers: headers }
    );
  }

  public askQuestion(
    eventId: string,
    question: string
  ): Observable<{ question: string }> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    const payload: AskQuestionData = { question };
    return this.http.post<any>(
      `${environment.API_URL}/me/events/${eventId}/questions`,
      payload,{ headers: headers }
    );
  }

  public joinEvent(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<any>(
      `${environment.API_URL}/me/events/${eventId}/join`,
      {},{ headers: headers }
    );
  }
  
  public leaveEvent(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<any>(
      `${environment.API_URL}/me/events/${eventId}/leave`,
      {},{ headers: headers }
    );
  }

  public checkIsVoted(eventId: string, shareholderId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Voting>(
      `${environment.API_URL}/me/events/${eventId}/vote?shareholderId=${shareholderId}`
      ,{ headers: headers });
  }

  public voteAsShareholder(
    eventId: string,
    shareholderId: string,
    voting: Array<ResolutionVotingEntry>
  ) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    const payload: VotingData = {
      type: 'SHAREHOLDER',
      refId: shareholderId,
      voting,
    };
    return this.http.post<any>(
      `${environment.API_URL}/me/events/${eventId}/vote`,
      payload
      ,{ headers: headers });
  }

  public voteAsProxy(
    eventId: string,
    proxyId: string,
    voting: Array<ResolutionVotingEntry>
  ) {
    const payload: VotingData = {
      type: 'PROXY',
      refId: proxyId,
      voting,
    };
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<any>(
      `${environment.API_URL}/me/events/${eventId}/vote`,
      payload
      ,{ headers: headers });
  }



  public getVoting(
    eventId: string,
    type: 'SHAREHOLDER' | 'PROXY' ,
    refId: string
  ) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Voting>(
      `${environment.API_URL}/me/events/${eventId}/vote`,
      {
        params: {
          type,
          refId,
        },
         headers: headers 
      }
    );
  }

  public getEventVotingResult(eventId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<ResolutionVotingResult[]>(
      `${environment.API_URL}/me/events/${eventId}/polling-result`
      ,{ headers: headers });
  }
}

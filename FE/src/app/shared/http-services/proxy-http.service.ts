import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  AddProxy,
  Proxy,
  ResolutionVotingEntry,
  ResolutionVotingResult,
  Voting,
} from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProxyHttpService {
  constructor(private http: HttpClient) {}

  public listProxies(eventId: string): Observable<Proxy[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Proxy[]>(`${environment.API_URL}/proxies`, {
      params: { eventId },headers: headers 
    });
  }

  public listProxiesVoting(eventId: string): Observable<Voting[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Voting[]>(`${environment.API_URL}/proxies/votings`, {
      params: { eventId },headers: headers 
    });
  }

  public generateVotingResult(
    eventId: string
  ): Observable<ResolutionVotingResult[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<ResolutionVotingResult[]>(
      `${environment.API_URL}/proxies/voting-result`,
      {
        params: { eventId },headers: headers 
      }
    );
  }

  public addProxy(eventId: string, proxy: AddProxy): Observable<Proxy> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Proxy>(`${environment.API_URL}/proxies`, proxy, {
      params: { eventId },headers: headers 
    });
  }

  public updateProxy(
    eventId: string,
    proxyId: string,
    proxy: AddProxy
  ): Observable<Proxy> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Proxy>(
      `${environment.API_URL}/proxies/${proxyId}`,
      proxy,
      {
        params: { eventId },headers: headers 
      }
    );
  }

  public getProxyVoting(eventId: string, proxyId: string): Observable<Voting> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Voting>(
      `${environment.API_URL}/proxies/${proxyId}/votings`,
      {
        params: { eventId },headers: headers 
      }
    );
  }

  public addProxyVoting(
    eventId: string,
    proxyId: string,
    voting: { result: Array<ResolutionVotingEntry> }
  ): Observable<Voting> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Voting>(
      `${environment.API_URL}/proxies/${proxyId}/votings`,
      voting,
      {
        params: { eventId },headers: headers 
      }
    );
  }
}

import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  ImportBuildResult,
  ResolutionVotingEntry,
  Shareholder,
  ShareUtilization,
  Voting,
} from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShareholderHttpService {
  constructor(private http: HttpClient) {}

  public listShareholders(eventId: string): Observable<Shareholder[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Shareholder[]>(`${environment.API_URL}/shareholders`, {
      params: { eventId },headers: headers
    });
  }

  public getShareholder(
    eventId: string,
    shareholderId: string
  ): Observable<Shareholder> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Shareholder>(
      `${environment.API_URL}/shareholders/${shareholderId}`,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public getShareholderImportTemplate(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get(
      `${environment.API_URL}/shareholders/download-template`,
      {
        responseType: 'blob',headers: headers
      }
    );
  }

  public getShareholderShareUtilization(
    eventId: string,
    shareholderId: string
  ): Observable<ShareUtilization> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<ShareUtilization>(
      `${environment.API_URL}/shareholders/${shareholderId}/share-utilization`,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public getShareholderCorpShareUtilization(
    eventId: string,
    shareholderId: string
  ): Observable<ShareUtilization> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<ShareUtilization>(
      `${environment.API_URL}/shareholders/${shareholderId}/sharecorp-utilization`,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public getShareholderVoting(
    eventId: string,
    shareholderId: string
  ): Observable<Voting> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Voting>(
      `${environment.API_URL}/shareholders/${shareholderId}/voting`,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public addShareholderVoting(
    eventId: string,
    shareholderId: string,
    voting: Array<ResolutionVotingEntry>,
    letterId?: string
  ): Observable<Voting> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Voting>(
      `${environment.API_URL}/shareholders/${shareholderId}/voting`,
      { voting, letterId },
      {
        params: { eventId },headers: headers
      }
    );
  }

  public createShareholder(
    eventId: string,
    shareholder: Shareholder
  ): Observable<Shareholder> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Shareholder>(
      `${environment.API_URL}/shareholders`,
      shareholder,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public updateShareholder(
    eventId: string,
    shareholderId: string,
    shareholder: Shareholder
  ): Observable<Shareholder> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Shareholder>(
      `${environment.API_URL}/shareholders/${shareholderId}`,
      shareholder,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public importShareholders(
    eventId: string,
    formData: FormData
  ): Observable<ImportBuildResult<Shareholder>> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    const params = new HttpParams();
    const options = {
      params: { ...params, eventId },
      reportProgress: true,
      headers: headers
    };
    return this.http.post<ImportBuildResult<Shareholder>>(
      `${environment.API_URL}/shareholders/import`,
      formData,
      options
    );
  }

  public deleteShareholder(
    eventId: string,
    shareholderId: string
  ): Observable<Shareholder> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.delete<Shareholder>(
      `${environment.API_URL}/shareholders/${shareholderId}`,
      {
        params: { eventId },headers: headers
      }
    );
  }

  public clearShareholders(eventId: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.delete<void>(`${environment.API_URL}/shareholders`, {
      params: { eventId },headers: headers
    });
  }
}

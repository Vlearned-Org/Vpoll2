import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { AddCorporate, Corporate } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CorporateHttpService {
  constructor(private http: HttpClient) {}

  public listCorporates(eventId: string): Observable<Corporate[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Corporate[]>(`${environment.API_URL}/corporates`, {
      params: { eventId },
      headers: headers
    });
  }

  public getCorporate(eventId: string, corporateId: string): Observable<Corporate> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.get<Corporate>(
      `${environment.API_URL}/corporates/${corporateId}`,
      { params: { eventId }, headers: headers },
    );
  }

  public addCorporate(eventId: string, corporate: AddCorporate): Observable<Corporate> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Corporate>(`${environment.API_URL}/corporates`, corporate, {
      params: { eventId }, headers: headers
    });
  }

  public updateCorporate(
    eventId: string,
    corporateId: string,
    corporate: AddCorporate
  ): Observable<Corporate> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Corporate>(
      `${environment.API_URL}/corporates/${corporateId}`,
      corporate,
      {
        params: { eventId }, headers: headers
      }
    );
  }
}

import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Event, Resolution } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolutionHttpService {
  constructor(private http: HttpClient) {}

  public createResolution(
    eventId: string,
    resolution: Resolution
  ): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.post<Event>(
      `${environment.API_URL}/resolutions`,
      resolution,
      { params: { eventId } ,headers: headers}
    );
  }

  public updateResolution(
    eventId: string,
    resolutionId: string,
    resolution: Resolution
  ): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.patch<Event>(
      `${environment.API_URL}/resolutions/${resolutionId}`,
      resolution,
      { params: { eventId },headers: headers }
    );
  }

  public deleteResolution(
    eventId: string,
    resolutionId: string
  ): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });
    return this.http.delete<Event>(
      `${environment.API_URL}/resolutions/${resolutionId}`,
      { params: { eventId },headers: headers }
    );
  }
}

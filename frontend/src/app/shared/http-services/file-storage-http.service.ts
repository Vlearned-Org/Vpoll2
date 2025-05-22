import { HttpClient ,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { RichInternalFile } from '@vpoll-shared/contract';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileStorageHttpService {
  constructor(private http: HttpClient) {}

  public uploadFile(file: FormData): Observable<RichInternalFile> {

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });

    console.log(headers)

    return this.http.post<RichInternalFile>(
      `${environment.API_URL}/storage`,
      file,
      {
        headers: headers, 
        reportProgress: true,
        params: { resize: 'false' },
      }
    );
  }

  public getPublicUrl(fileId: string): Observable<{ partialUrl: string }> {

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });

    console.log(headers)

    return this.http.get<{ partialUrl: string }>(
      `${environment.API_URL}/storage/file-public-url/${fileId}`,

      {
        headers: headers, 
      }
    );
  }

  public serve(partialUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      // Any other headers you want to add
    });

    return this.http.get(`${environment.API_URL}/storage/${partialUrl}`, {
      responseType: 'blob',
      headers: headers, 
    });
  }
}

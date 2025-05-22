import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';
import { map } from 'rxjs';
import { FileStorageHttpService } from '../http-services/file-storage-http.service';

// This is the pipe we have to use to get files from the filesystem v2
// images or another type of files
@Pipe({ name: 'storage' })
export class StoragePipe implements PipeTransform {
  constructor(private fileSvc: FileStorageHttpService) {}

  public transform(fileId: string) {
    console.log('Storage', fileId);
    if (!fileId) {
      return null;
    }

    return this.fileSvc.getPublicUrl(fileId).pipe(
      map((payload) => {
        return `${environment.API_URL}/storage/serve/${payload.partialUrl}`;
      })
    );
    // .subscribe((payload) => {

    // });

    // return this.fileSvc.serve(fileId).pipe(
    //   mergeMap((data) => {
    //     var reader = new FileReader();
    //     reader.readAsDataURL(data);
    //     return Observable.create((observer: Subscriber<any[]>): void => {
    //       reader.onload = (ev: ProgressEvent): void => {
    //         observer.next((<any>ev.target).result);
    //         observer.complete();
    //       };

    //       // if failed
    //       reader.onerror = (error): void => {
    //         observer.error(error);
    //       };
    //     });
    //   })
    // );
  }
}

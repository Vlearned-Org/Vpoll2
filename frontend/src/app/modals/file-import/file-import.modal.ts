import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { WebSocketService } from '@app/services/websocket.service';
import { ShareholderHttpService } from '@app/shared/http-services/shareholder-http.service';
import { Store } from '@ngxs/store';
import { Event, FileTypeEnum, ImportStatusEnum } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { delay } from 'rxjs';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-file-import',
  templateUrl: './file-import.modal.html',
  styleUrls: ['./file-import.modal.scss'],
})
export class FileImportModal implements OnInit {
  public uploadProgress: number = 0;
  public statuses: ImportStatusEnum[];
  public fileType: FileTypeEnum;
  public event: Event;

  public file: any;

  constructor(
    private websocketSvc: WebSocketService,
    private config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private shareholderHttpSvc: ShareholderHttpService,
    private store: Store,
    private messageSvc: MessageService,
    private eventContext: EventContextService
  ) {}

  ngOnInit(): void {
    this.event = this.config.data.event;
    this.fileType = this.config.data.fileType;

    this.statuses = [];
  }

  onFileSelect(event) {
    const files = event.target.files;

    if (files.length === 0) {
      return;
    }

    this.file = files[0];
  }
  private checkDuplicates(array): any[] {
    const duplicates = [];
    const seenValues = new Set();

    for (const value of array) {
        if (seenValues.has(value)) {
            duplicates.push(value);
        } else {
            seenValues.add(value);
        }
    }

    return duplicates;
}


  public uploadFile() {
    this.statuses.push(ImportStatusEnum.PREPARING);
    const formData = new FormData();
    formData.append('file', this.file);

    const reader = new FileReader();
    reader.onload = (event: any) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, {
            type: 'binary'
        });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const columnValues = jsonData.map(row => row['__EMPTY_3']);
        
        const duplicates = this.checkDuplicates(columnValues);

        if (duplicates.length > 0) {
            console.log('Duplicated CDS Numbers:', duplicates);
            this.messageSvc.add({
                key: 'toast',
                severity: 'error',
                detail: 'Duplicate values found in CDS Column!',
            });
        } else {
            this.proceedToUpload(formData);
        }
    };
    reader.readAsBinaryString(this.file);
}

  private async  proceedToUpload(formData) {
    switch (this.fileType) {
      
      case FileTypeEnum.SHAREHOLDER:
        const response = await this.shareholderHttpSvc.importShareholders(this.event._id, formData).toPromise();
        if (response.status === 'error') {
          this.messageSvc.add({
            key: 'toast',
            severity: 'error',
            detail: response.errors[0].code,
          });
          return;
        }

          console.log("Hey!");
          this.websocketSvc.getUploadFileStatus(this.fileType, (data) => {

            console.log(data.progress);
            if (data.status !== this.statuses[this.statuses.length - 1]) {
              this.statuses.push(data.status);
            }
            if (data.status === ImportStatusEnum.SAVING) {
              this.uploadProgress = data.progress;
            }
            if (data.status === ImportStatusEnum.UPLOADED) {
              this.statuses.push(ImportStatusEnum.COMPLETED);
              this.eventContext
                .selectedEvent(this.event._id)
                .pipe(delay(2000))
                .subscribe(() => {
                  console.log('TEST', this.event._id);
                  this.websocketSvc.removeFileUpdateStatus(this.fileType);
                  this.dialogRef.close();
                });
            }
          });

        break;
      default:
        return null;
    }
}



  public formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
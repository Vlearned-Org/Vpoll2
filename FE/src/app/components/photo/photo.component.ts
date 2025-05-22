import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileStorageHttpService } from '@app/shared/http-services/file-storage-http.service';
import { RichInternalFile } from '@vpoll-shared/contract';
import { FileFormatsEnum } from '@vpoll-shared/enum';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
})
export class PhotoComponent implements OnInit {
  @Input() public photoUrl: string;

  @Output() private photoUploaded: EventEmitter<RichInternalFile> =
    new EventEmitter();
  @Output() private photoDeleted: EventEmitter<string> = new EventEmitter();
  @Output() public photoClicked: EventEmitter<boolean> = new EventEmitter();

  public displayDelete: boolean;

  constructor(
    private toastSvc: MessageService,
    private confirmationSvc: ConfirmationService,
    private fileSvc: FileStorageHttpService
  ) {}

  public ngOnInit(): void {
    this.displayDelete = false;
  }

  public setDisplayDelete(display: boolean): void {
    this.displayDelete = display;
  }

  public setOpenConfirmDelete(): void {
    this.confirmationSvc.confirm({
      key: 'openConfirmDelete',
      message: 'Are you sure you want to delete company logo?',
      accept: () => this.deletePhoto(),
    });
  }

  public deletePhoto(): void {
    this.photoDeleted.next(this.photoUrl);
  }

  public uploadPhoto(event): void {
    const files = event.target.files;

    if (files.length === 0) {
      return;
    }

    const name = files[0].name.toLowerCase() as string;
    const isImgFormat =
      name.includes(FileFormatsEnum.png) ||
      name.includes(FileFormatsEnum.jpg) ||
      name.includes(FileFormatsEnum.jpeg);

    if (!isImgFormat) {
      this.toastSvc.add({
        key: 'toast',
        severity: 'error',
        summary: 'Invalid file format',
        detail: 'Import fail',
      });

      return;
    }
    const formData = new FormData();
    formData.append('file', files[0]);
    this.fileSvc
      .uploadFile(formData)
      .subscribe((file) => this.photoUploaded.next(file));
  }
}

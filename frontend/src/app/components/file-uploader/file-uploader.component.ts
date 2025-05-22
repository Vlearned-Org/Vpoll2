import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { FileStorageHttpService } from '@app/shared/http-services/file-storage-http.service';
import { InternalFile, RichInternalFile } from '@vpoll-shared/contract';
import { FileFormatsEnum } from '@vpoll-shared/enum';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent implements OnInit, OnChanges {
  @Input() public description: string = 'Upload pdf or image';
  @Input() public file: InternalFile;
  @Input() public canEdit: boolean = false;
  @Input() public enableDisplay: boolean = true;

  @Output() private fileUploaded: EventEmitter<RichInternalFile> =
    new EventEmitter();
  @Output() private fileDeleted: EventEmitter<InternalFile> =
    new EventEmitter();

  public name: string;

  constructor(
    private messageSvc: MessageService,
    private fileSvc: FileStorageHttpService
  ) {}

  ngOnInit(): void {
    this.name = this.file ? this.file.name : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fileChange: SimpleChange = changes.file;
    this.name = fileChange.currentValue ? fileChange.currentValue.name : null;
  }

  public deleteFile(): void {
    this.fileDeleted.next(this.file);
  }

  public uploadFile(event) {
    const files = event.target.files;

    if (files.length === 0) {
      return;
    }

    const name = files[0].name.toLowerCase() as string;

    if (!this.isPdfFormat(name) && !this.isImgFormat(name)) {
      this.messageSvc.add({
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
      .subscribe((file) => this.fileUploaded.next(file));
  }

  public isPdfFormat(name) {
    if (!name) {
      return false;
    }
    return name.includes(FileFormatsEnum.pdf);
  }

  public isImgFormat(name) {
    if (!name) {
      return false;
    }
    return (
      name.includes(FileFormatsEnum.png) ||
      name.includes(FileFormatsEnum.jpg) ||
      name.includes(FileFormatsEnum.jpeg)
    );
  }
}

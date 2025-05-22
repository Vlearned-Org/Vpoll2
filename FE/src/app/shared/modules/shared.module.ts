import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { StoragePipe } from '../pipes/storage.pipe';
import { PrimengModule } from './primeng.module';

@NgModule({
  declarations: [StoragePipe],
  imports: [SharedModule.MODULE_LIST],
  exports: [SharedModule.MODULE_LIST, StoragePipe],
})
export class SharedModule {
  public static readonly MODULE_LIST = [
    CommonModule,
    FormsModule,
    PrimengModule,
    ReactiveFormsModule,
    PdfViewerModule,
  ];
}

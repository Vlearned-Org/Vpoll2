import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DataModule } from '@app/data/data.module';
import { DataRetentionService } from './data-retention.service';
import { DataProcessingRecordService } from './data-processing-record.service';

@Module({
  imports: [
    DataModule,
    ScheduleModule.forRoot(), // Enable cron jobs for data retention
  ],
  providers: [
    DataRetentionService,
    DataProcessingRecordService,
  ],
  exports: [
    DataRetentionService,
    DataProcessingRecordService,
  ],
})
export class PrivacyModule {} 
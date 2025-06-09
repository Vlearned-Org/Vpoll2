import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Consent, DataSubjectRequest, PrivacySettings } from '@app/data/model/consent.model';
import { DataRetentionService } from '@app/core/privacy/data-retention.service';
import { DataProcessingRecordService } from '@app/core/privacy/data-processing-record.service';
import { JwtAuthGuard } from '@app/core/auth/strategies/jwt.strategy';
import { ApiContext } from '@app/core/context/api-context-param.decorator';
import { Context } from '@vpoll-shared/contract';

@Controller('privacy')
export class PrivacyController {
  constructor(
    private dataRetentionService: DataRetentionService,
    private dataProcessingRecordService: DataProcessingRecordService
  ) {}

  // Data Subject Rights Endpoints

  @Get('data-export')
  @UseGuards(JwtAuthGuard)
  async exportUserData(@ApiContext() context: Context) {
    return await this.dataRetentionService.exportUserData(context.id);
  }

  @Post('data-deletion-request')
  @UseGuards(JwtAuthGuard)
  async requestDataDeletion(@ApiContext() context: Context) {
    // Create a data subject request for deletion
    const request: Partial<DataSubjectRequest> = {
      userId: context.id,
      requestId: `DEL_${Date.now()}`,
      requestType: 'erasure' as any,
      status: 'pending' as any,
      requestDate: new Date(),
      description: 'User requested data deletion under GDPR Article 17'
    };

    // In a real implementation, this would be saved to database
    // and processed by data protection team
    return {
      message: 'Data deletion request submitted successfully',
      requestId: request.requestId,
      estimatedProcessingTime: '30 days'
    };
  }

  @Post('data-rectification-request')
  @UseGuards(JwtAuthGuard)
  async requestDataRectification(
    @ApiContext() context: Context,
    @Body() rectificationData: any
  ) {
    const request: Partial<DataSubjectRequest> = {
      userId: context.id,
      requestId: `RECT_${Date.now()}`,
      requestType: 'rectification' as any,
      status: 'pending' as any,
      requestDate: new Date(),
      description: 'User requested data rectification under GDPR Article 16',
      requestDetails: JSON.stringify(rectificationData)
    };

    return {
      message: 'Data rectification request submitted successfully',
      requestId: request.requestId,
      estimatedProcessingTime: '30 days'
    };
  }

  @Post('data-portability-request')
  @UseGuards(JwtAuthGuard)
  async requestDataPortability(@ApiContext() context: Context) {
    const exportData = await this.dataRetentionService.exportUserData(context.id);
    
    return {
      message: 'Data portability request processed',
      data: exportData,
      format: 'JSON',
      exportDate: new Date()
    };
  }

  @Post('processing-restriction-request')
  @UseGuards(JwtAuthGuard)
  async requestProcessingRestriction(
    @ApiContext() context: Context,
    @Body() restrictionData: { reason: string; dataCategories: string[] }
  ) {
    const request: Partial<DataSubjectRequest> = {
      userId: context.id,
      requestId: `RESTR_${Date.now()}`,
      requestType: 'restriction' as any,
      status: 'pending' as any,
      requestDate: new Date(),
      description: 'User requested processing restriction under GDPR Article 18',
      requestDetails: JSON.stringify(restrictionData)
    };

    return {
      message: 'Processing restriction request submitted successfully',
      requestId: request.requestId,
      estimatedProcessingTime: '30 days'
    };
  }

  @Post('processing-objection')
  @UseGuards(JwtAuthGuard)
  async objectToProcessing(
    @ApiContext() context: Context,
    @Body() objectionData: { reason: string; processingActivities: string[] }
  ) {
    const request: Partial<DataSubjectRequest> = {
      userId: context.id,
      requestId: `OBJ_${Date.now()}`,
      requestType: 'objection' as any,
      status: 'pending' as any,
      requestDate: new Date(),
      description: 'User objected to processing under GDPR Article 21',
      requestDetails: JSON.stringify(objectionData)
    };

    return {
      message: 'Processing objection submitted successfully',
      requestId: request.requestId,
      estimatedProcessingTime: '30 days'
    };
  }

  // Consent Management Endpoints

  @Post('consent')
  @UseGuards(JwtAuthGuard)
  async recordConsent(
    @ApiContext() context: Context,
    @Body() consents: Consent[]
  ) {
    // In a real implementation, save consents to database
    // and trigger appropriate processing based on consent status
    
    return {
      message: 'Consent preferences recorded successfully',
      consentsRecorded: consents.length,
      timestamp: new Date()
    };
  }

  @Get('consent-history')
  @UseGuards(JwtAuthGuard)
  async getConsentHistory(@ApiContext() context: Context) {
    // In a real implementation, retrieve from database
    return {
      userId: context.id,
      consentHistory: [], // Would be populated from database
      currentVersion: '1.0'
    };
  }

  @Put('consent/:consentType/withdraw')
  @UseGuards(JwtAuthGuard)
  async withdrawConsent(
    @ApiContext() context: Context,
    @Param('consentType') consentType: string,
    @Body() withdrawalData: { reason?: string }
  ) {
    // Record consent withdrawal
    const withdrawalRecord: Partial<Consent> = {
      consentId: `withdrawal_${consentType}_${Date.now()}`,
      consentType: consentType as any,
      granted: false,
      timestamp: new Date(),
      withdrawnAt: new Date(),
      withdrawalReason: withdrawalData.reason || 'User withdrawal'
    };

    return {
      message: 'Consent withdrawn successfully',
      consentType,
      withdrawnAt: new Date()
    };
  }

  // Privacy Settings Endpoints

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getPrivacySettings(@ApiContext() context: Context) {
    // In a real implementation, retrieve from database
    const settings: Partial<PrivacySettings> = {
      userId: context.id,
      emailCommunicationConsent: true,
      marketingConsent: false,
      analyticsConsent: false,
      functionalCookiesConsent: true,
      legalComplianceConsent: true,
      consentVersion: '1.0',
      lastConsentUpdate: new Date()
    };

    return settings;
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async updatePrivacySettings(
    @ApiContext() context: Context,
    @Body() settings: Partial<PrivacySettings>
  ) {
    // In a real implementation, save to database and trigger
    // appropriate processing changes based on new settings
    
    return {
      message: 'Privacy settings updated successfully',
      updatedAt: new Date(),
      settings
    };
  }

  // Data Retention Information

  @Get('retention-policies')
  async getRetentionPolicies() {
    return {
      policies: this.dataRetentionService.getRetentionPolicies(),
      lastUpdated: new Date()
    };
  }

  @Get('processing-activities')
  async getProcessingActivities() {
    return {
      activities: this.dataProcessingRecordService.getAllProcessingActivities(),
      recordGenerated: new Date(),
      organization: 'VPoll Electronic Voting Platform'
    };
  }

  // Legal Documents

  @Get('privacy-policy')
  async getPrivacyPolicy() {
    return {
      document: 'privacy-policy',
      version: '1.0',
      lastUpdated: new Date(),
      content: 'Privacy policy content would be served here',
      // In production, this would serve the actual privacy policy document
    };
  }

  @Get('cookie-policy')
  async getCookiePolicy() {
    return {
      document: 'cookie-policy',
      version: '1.0',
      lastUpdated: new Date(),
      content: 'Cookie policy content would be served here'
    };
  }

  @Get('terms-conditions')
  async getTermsAndConditions() {
    return {
      document: 'terms-conditions',
      version: '1.0',
      lastUpdated: new Date(),
      content: 'Terms and conditions content would be served here'
    };
  }

  // Compliance Reporting (Admin only endpoints would have additional guards)

  @Get('compliance-report')
  @UseGuards(JwtAuthGuard) // Add admin role guard in real implementation
  async getComplianceReport() {
    return {
      reportDate: new Date(),
      dataProcessingActivities: this.dataProcessingRecordService.getAllProcessingActivities().length,
      retentionPolicies: this.dataRetentionService.getRetentionPolicies().length,
      deletionRecords: this.dataRetentionService.getDeletionRecords().length,
      // Add more compliance metrics
    };
  }

  @Get('deletion-records')
  @UseGuards(JwtAuthGuard) // Add admin role guard in real implementation
  async getDeletionRecords() {
    return {
      records: this.dataRetentionService.getDeletionRecords(),
      totalRecords: this.dataRetentionService.getDeletionRecords().length
    };
  }
} 
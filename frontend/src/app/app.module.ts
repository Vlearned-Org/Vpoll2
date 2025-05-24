import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtInterceptor, JwtModule } from '@auth0/angular-jwt';
import { environment } from '@environments/environment';
import { NgxsModule } from '@ngxs/store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppConfigComponent } from './app.config.component';
import { AppMainComponent } from './app.main.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { CdsAbstainTableComponent } from './components/cds-abstain-table/cds-abstain-table.component';
import { DirectorTableComponent } from './components/director-table/director-table.component';
import { EventDashboardComponent } from './components/event-dashboard/event-dashboard.component';
import { EventPageComponent } from './components/event-page/event-page.component';
import { EventReportsComponent } from './components/event-reports/event-reports.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { InviteeTableComponent } from './components/invitee-table/invitee-table.component';
import { PhotoComponent } from './components/photo/photo.component';
import { CorporateTableComponent } from './components/corporate-table/corporate-table.component';
import { ProxyTableComponent } from './components/proxy-table/proxy-table.component';
import { ProxyVotingComponent } from './components/proxy-voting/proxy-voting.component';
import { ResolutionTableComponent } from './components/resolution-table/resolution-table.component';
import { ResolutionVotingComponent } from './components/resolution-voting/resolution-voting.component';
import { ShareholderTableComponent } from './components/shareholder-table/shareholder-table.component';
import { AdminUserModal } from './modals/admin-user/admin-user.modal';
import { AskQuestionModal } from './modals/ask-question/ask-question.modal';
import { CreateCompanyModal } from './modals/create-company/create-company.modal';
import { EnquiryModal } from './modals/enquiry/enquiry.modal';
import { EventModal } from './modals/event/event.modal';
import { FileImportModal } from './modals/file-import/file-import.modal';
import { InviteeModal } from './modals/invitee/invitee.modal';

import { QuestionListComponent } from './components/question-list/question-list.component';
import { ProxyModal } from './modals/proxy/proxy.modal';
import { CorporateModal } from './modals/corporate/corporate.modal';
import { ResolutionModal } from './modals/resolution/resolution.modal';
import { ShareholderModal } from './modals/shareholder/shareholder.modal';
import { UserApprovalModal } from './modals/user-approval/user-approval.modal';
import { UserVotingModal } from './modals/user-voting/user-voting.modal';
import { ViewPublishResultModal } from './modals/view-publish-result/view-publish-result.modal';
import { VoteOnBehalfModal } from './modals/vote-on-behalf/vote-on-behalf.modal';
import { AdminsAccessComponent } from './pages/admin/admins-access/admins-access.component';
import { CompanyEventsComponent } from './pages/admin/company-events/company-events.component';
import { CompanyInfoComponent } from './pages/admin/company-info/company-info.component';
import { AdminLoginComponent } from './pages/public/admin-login/admin-login.component';
import { ForgetPasswordComponent } from './pages/public/forget-password/forget-password.component';
import { LandingComponent } from './pages/public/landing/landing.component';
import { LoginComponent } from './pages/public/login/login.component';
import { SignupComponent } from './pages/public/signup/signup.component';
import { ResetPasswordComponent } from './pages/public/reset-password/reset-password.component';
import { CompanyListComponent } from './pages/system/company-list/company-list.component';
import { UserListComponent } from './pages/system/user-list/user-list.component';
import { UserEventComponent } from './pages/user/user-event/user-event.component';
import { UserEventlistComponent } from './pages/user/user-eventlist/user-eventlist.component';
import { UserHomepageComponent } from './pages/user/user-homepage/user-homepage.component';
import { AppCodeModule } from './sample-components/app-code/app.code.component';
import { BlocksComponent } from './sample-components/blocks/blocks.component';
import { BlockViewer } from './sample-components/blockviewer/blockviewer.component';

import { DashboardComponent } from './sample-components/dashboard/dashboard.component';
import { DocumentationComponent } from './sample-components/documentation/documentation.component';
import { FloatLabelComponent } from './sample-components/floatlabel/floatlabel.component';
import { FormLayoutComponent } from './sample-components/formlayout/formlayout.component';

import { ConfirmationComponent } from './sample-components/menus/confirmation.component';
import { MenusComponent } from './sample-components/menus/menus.component';
import { PaymentComponent } from './sample-components/menus/payment.component';
import { PersonalComponent } from './sample-components/menus/personal.component';
import { SeatComponent } from './sample-components/menus/seat.component';
import { HttpErrorInterceptor } from './shared/interceptor/http-error.interceptor';
import { RefreshTokenInterceptor } from './shared/interceptor/refresh-token.interceptor';
import { PrimengModule } from './shared/modules/primeng.module';
import { SharedModule } from './shared/modules/shared.module';
import { ShareholderState } from './store/shareholder-state.service';
import { MatExpansionModule } from '@angular/material/expansion'; 


const MODALS = [
  CreateCompanyModal,
  EventModal,
  ResolutionModal,
  ProxyModal,
  CorporateModal,
  FileImportModal,
  ShareholderModal,
  UserApprovalModal,
  AdminUserModal,
  UserVotingModal,
  EnquiryModal
];

@NgModule({
  imports: [
    PrimengModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatExpansionModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('access_token');
        },
        skipWhenExpired: false,
        allowedDomains: [environment.APP_DOMAIN, environment.API_DOMAIN],
        disallowedRoutes: [],
        // FIXME: APP_DOMAIN will be removed when we add filemanager in gateway
        // Only API_DOMAIN is whitelisted
      },
    }),
    NgxsModule.forRoot([ShareholderState], {
      developmentMode: !environment.production,
    }),
    SharedModule,
    BrowserAnimationsModule,
    AppCodeModule,
  ],
  declarations: [
    ...MODALS,
    AppComponent,
    AppMainComponent,
    AppTopBarComponent,
    AppConfigComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    DashboardComponent,
    FormLayoutComponent,
    FloatLabelComponent,
    MenusComponent,
    DocumentationComponent,
    BlocksComponent,
    BlockViewer,
    PaymentComponent,
    ConfirmationComponent,
    PersonalComponent,
    SeatComponent,
    LandingComponent,
    AdminLoginComponent,
    LoginComponent,
    CompanyListComponent,
    UserListComponent,
    CompanyInfoComponent,
    CompanyEventsComponent,
    EventPageComponent,
    ShareholderTableComponent,
    ResolutionTableComponent,
    CdsAbstainTableComponent,
    EventDashboardComponent,
    DirectorTableComponent,
    ProxyTableComponent,
    CorporateTableComponent,
    PhotoComponent,
    FileUploaderComponent,
    ResolutionVotingComponent,
    UserHomepageComponent,
    UserEventComponent,
    UserEventlistComponent,
    ProxyVotingComponent,
    ForgetPasswordComponent,
    SignupComponent,
    ResetPasswordComponent,
    AdminsAccessComponent,
    InviteeTableComponent,
    InviteeModal,
    AuditLogComponent,
    EventReportsComponent,
    AskQuestionModal,
    QuestionListComponent,
    VoteOnBehalfModal,
    ViewPublishResultModal,
  ],
  providers: [
    JwtInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,
      multi: true,
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    DialogService,
    MessageService,
    ConfirmationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoleEnum } from '@vpoll-shared/enum';
import { AppMainComponent } from './app.main.component';
import { EventAnalyticsComponent } from './components/event-analytics/event-analytics.component';
import { EventPageComponent } from './components/event-page/event-page.component';
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
import { ProfileComponent } from './pages/user/profile/profile.component';
import { PrivacySettingsComponent } from './shared/components/privacy-settings/privacy-settings.component';
import { LegacyUserRequestComponent } from './pages/public/legacy-user-request/legacy-user-request.component';
import { LegacyUsersComponent } from './pages/admin/legacy-users/legacy-users.component';
import { LegacyUserRequestsComponent } from './pages/admin/legacy-user-requests/legacy-user-requests.component';
import { BlocksComponent } from './sample-components/blocks/blocks.component';
import { DashboardComponent } from './sample-components/dashboard/dashboard.component';
import { DocumentationComponent } from './sample-components/documentation/documentation.component';
import { FloatLabelComponent } from './sample-components/floatlabel/floatlabel.component';
import { FormLayoutComponent } from './sample-components/formlayout/formlayout.component';
import { LoggedInGuard } from './shared/security/guards/logged-in.guard';
import { RoleGuard } from './shared/security/guards/role.guard';
@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: 'home',
          component: AppMainComponent,
          children: [
            {
              path: '',
              canActivate: [LoggedInGuard],
              component: UserHomepageComponent,
            },
          ],
        },
        {
          path: 'events',
          component: AppMainComponent,
          children: [
            {
              path: '',
              canActivate: [LoggedInGuard],
              component: UserEventlistComponent,
            },
          ],
        },
        {
          path: 'profile',
          component: AppMainComponent,
          children: [
            {
              path: '',
              canActivate: [LoggedInGuard],
              component: ProfileComponent,
            },
          ],
        },
        {
          path: 'privacy-settings',
          component: AppMainComponent,
          children: [
            {
              path: '',
              canActivate: [LoggedInGuard],
              component: PrivacySettingsComponent,
            },
          ],
        },
        {
          path: 'events/:eventId',
          canActivate: [LoggedInGuard],
          component: UserEventComponent,
        },
        { path: 'login', component: LoginComponent },
        { path: 'sign-up', component: SignupComponent },
        { path: 'legacy-user-request', component: LegacyUserRequestComponent },
        { path: 'forget-password', component: ForgetPasswordComponent },
        { path: 'signin/reset-password', component: ResetPasswordComponent },
        { path: 'admin/login', component: AdminLoginComponent },
        {
          path: 'admin',
          component: AppMainComponent,
          children: [
            { path: 'dashboard', component: DashboardComponent },
            {
              path: 'company-list',
              canActivate: [LoggedInGuard, RoleGuard],
              data: { roles: [RoleEnum.SYSTEM] },
              component: CompanyListComponent,
            },
            {
              path: 'user-list',
              canActivate: [LoggedInGuard, RoleGuard],
              data: { roles: [RoleEnum.SYSTEM] },
              component: UserListComponent,
            },
            {
              path: 'legacy-users',
              canActivate: [LoggedInGuard, RoleGuard],
              data: { roles: [RoleEnum.SYSTEM] },
              component: LegacyUsersComponent,
            },
            {
              path: 'legacy-user-requests',
              canActivate: [LoggedInGuard, RoleGuard],
              data: { roles: [RoleEnum.SYSTEM] },
              component: LegacyUserRequestsComponent,
            },
            {
              path: 'company/profile',
              canActivate: [LoggedInGuard, RoleGuard],
              data: {
                roles: [RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN],
              },
              component: CompanyInfoComponent,
            },
            {
              path: 'company/users',
              canActivate: [LoggedInGuard, RoleGuard],
              data: {
                roles: [RoleEnum.COMPANY_SYSTEM],
              },
              component: AdminsAccessComponent,
            },
            {
              path: 'company/events',
              canActivate: [LoggedInGuard, RoleGuard],
              data: {
                roles: [RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN],
              },
              component: CompanyEventsComponent,
            },
            {
              path: 'company/events/:eventId',
              canActivate: [LoggedInGuard, RoleGuard],
              data: {
                roles: [RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN],
              },
              component: EventPageComponent,
            },
            {
              path: 'company/events/:eventId/analytics',
              canActivate: [LoggedInGuard, RoleGuard],
              data: {
                roles: [RoleEnum.COMPANY_SYSTEM, RoleEnum.COMPANY_ADMIN],
              },
              component: EventAnalyticsComponent,
            },
            {
              path: 'uikit/formlayout',
              component: FormLayoutComponent,
            },
            {
              path: 'uikit/floatlabel',
              component: FloatLabelComponent,
            },
            {
              path: 'uikit/menu',
              loadChildren: () =>
                import('./sample-components/menus/menus.module').then(
                  (m) => m.MenusModule
                ),
            },
            { path: 'blocks', component: BlocksComponent },
            {
              path: 'documentation',
              component: DocumentationComponent,
            },
          ],
        },
        {
          path: 'uikit',
          component: AppMainComponent,
          children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'formlayout', component: FormLayoutComponent },

            { path: 'floatlabel', component: FloatLabelComponent },
            {
              path: 'menu',
              loadChildren: () =>
                import('./sample-components/menus/menus.module').then(
                  (m) => m.MenusModule
                ),
            },
            { path: 'blocks', component: BlocksComponent },
            {
              path: 'documentation',
              component: DocumentationComponent,
            },
          ],
        },

        { path: '', component: LandingComponent },
        { path: '**', redirectTo: '', pathMatch: 'full' },
      ],
      { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

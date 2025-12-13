import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminLoginComponent } from './login/admin-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CoursesComponent } from './courses/courses.component';
import { StudentsComponent } from './students/students.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { QueriesComponent } from './queries/queries.component';
import { HeroSlidersComponent } from './hero-sliders/hero-sliders.component';
import { GalleryComponent } from './gallery/gallery.component';
import { BlogsComponent } from './blogs/blogs.component';
import { VideoHubComponent } from './video-hub/video-hub.component';
import { PartnersComponent } from './partners/partners.component';
import { SettingsComponent } from './settings/settings.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

export const adminRoutes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'certificates', component: CertificatesComponent },
      { path: 'queries', component: QueriesComponent },
      { path: 'hero-sliders', component: HeroSlidersComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'blogs', component: BlogsComponent },
      { path: 'video-hub', component: VideoHubComponent },
      { path: 'partners', component: PartnersComponent },
      { path: 'settings', component: SettingsComponent }
      ,{ path: 'change-password', component: ChangePasswordComponent }
    ]
  }
];

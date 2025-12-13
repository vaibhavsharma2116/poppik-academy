import { Routes } from '@angular/router';
import { PoliciesComponent } from './policies/policies.component';
import { HomeComponent } from './home/home.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { adminRoutes } from './admin/admin.routes';
import { LoginComponent } from './auth/login.component';
import { SignupComponent } from './auth/signup.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'blog/:id', component: BlogDetailComponent },
  { path: 'video/:id', component: VideoDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'policies', component: PoliciesComponent },
  { path: 'admin', children: adminRoutes }
];

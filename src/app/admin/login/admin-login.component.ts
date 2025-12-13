import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  login() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }

    this.loading = true;
    console.log('[Login] Attempting login with email:', this.email);

    this.adminService.login(this.email, this.password).subscribe({
      next: (resp: any) => {
        this.loading = false;
        console.log('[Login] Response:', resp);
        if (resp && resp.success && resp.adminId) {
          console.log('[Login] Setting admin ID:', resp.adminId);
          // Store admin ID
          this.adminService.setAdminId(resp.adminId);
          console.log('[Login] Stored admin ID, redirecting to dashboard');
          // Redirect to dashboard
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.error = (resp && resp.message) || 'Login failed';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('[Login] Error:', err);
        this.error = 'Error during login. Please try again.';
        console.error(err);
      }
    });
  }
}

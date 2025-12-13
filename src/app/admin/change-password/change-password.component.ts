import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message = '';
  error = '';

  constructor(private adminService: AdminService) {}

  submit() {
    this.message = '';
    this.error = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill all fields.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'New password and confirmation do not match.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.error = 'New password should be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.adminService.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: (resp: any) => {
        this.loading = false;
        if (resp && resp.success) {
          this.message = 'Password changed successfully.';
          this.currentPassword = this.newPassword = this.confirmPassword = '';
        } else {
          this.error = (resp && resp.message) || 'Failed to change password.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error while changing password.';
        console.error(err);
      }
    });
  }
}

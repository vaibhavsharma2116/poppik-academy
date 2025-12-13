import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router, private adminService: AdminService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if admin is logged in (check for adminId in localStorage)
    const adminId = this.adminService.getAdminId();

    if (adminId) {
      return true; // User is logged in, allow access
    }

    // User is not logged in, redirect to admin login
    this.router.navigate(['/admin/login']);
    return false;
  }
}

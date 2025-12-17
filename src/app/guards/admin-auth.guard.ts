import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if admin is logged in (check localStorage or sessionStorage for auth token)
    const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

    if (adminToken) {
      return true; // User is logged in, allow access
    }

    // User is not logged in, redirect to admin login
    this.router.navigate(['/admin/login']);
    return false;
  }
}

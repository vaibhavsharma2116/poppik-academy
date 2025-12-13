import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminService } from './admin.service';

@Injectable()
export class AdminAuthInterceptor implements HttpInterceptor {
  constructor(private adminService: AdminService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get admin ID from local storage
    const adminId = this.adminService.getAdminId();

    // If admin is logged in, add admin_id to query params
    if (adminId) {
      console.log('[Interceptor] Adding admin_id to request:', adminId, 'URL:', req.url);

      // Simple approach: just append to URL string
      const separator = req.url.includes('?') ? '&' : '?';
      const newUrl = `${req.url}${separator}admin_id=${adminId}`;

      req = req.clone({
        url: newUrl
      });

      console.log('[Interceptor] New URL:', req.url);
    } else {
      console.log('[Interceptor] No admin_id found in localStorage');
    }

    return next.handle(req);
  }
}

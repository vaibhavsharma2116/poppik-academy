import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  sidebarCollapsed = false;
  profileOpen = false;
  menuItems = [
    { icon: 'home', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'menu_book', label: 'Courses', route: '/admin/courses' },
    { icon: 'people', label: 'Students', route: '/admin/students' },
    { icon: 'verified', label: 'Certificates', route: '/admin/certificates' },
    { icon: 'help_outline', label: 'Queries', route: '/admin/queries' },
    { icon: 'view_carousel', label: 'Hero Sliders', route: '/admin/hero-sliders' },
    { icon: 'collections', label: 'Gallery', route: '/admin/gallery' },
    { icon: 'description', label: 'Blogs', route: '/admin/blogs' },
    { icon: 'smart_display', label: 'Video Hub', route: '/admin/video-hub' },
    { icon: 'handshake', label: 'Partners', route: '/admin/partners' },
    { icon: 'settings', label: 'Settings', route: '/admin/settings' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    try {
      const v = localStorage.getItem('admin.sidebarCollapsed');
      if (v !== null) this.sidebarCollapsed = JSON.parse(v);
    } catch (e) {}
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    // persist preference
    try { localStorage.setItem('admin.sidebarCollapsed', JSON.stringify(this.sidebarCollapsed)); } catch(e){}
  }

  toggleProfileMenu() {
    this.profileOpen = !this.profileOpen;
  }

  closeProfileMenu() {
    this.profileOpen = false;
  }

  goToProfile() {
    this.closeProfileMenu();
    this.router.navigate(['/admin/settings']);
  }

  goToChangePassword() {
    this.closeProfileMenu();
    // route placeholder - change if you have a dedicated change-password route
    this.router.navigate(['/admin/change-password']);
  }

  logout() {
    this.closeProfileMenu();
    // placeholder logout behaviour
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}

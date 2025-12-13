
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any[] = [];
  recentStudents: any[] = [];
  recentQueries: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
    this.loadRecentStudents();
    this.loadRecentQueries();
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          // Convert stats object to array for @for loop
          this.stats = [
            { label: 'Total Courses', value: response.data.courses, icon: '📚' },
            { label: 'Total Students', value: response.data.students, icon: '👥' },
            { label: 'Certificates Issued', value: response.data.certificates, icon: '🎓' },
            { label: 'Pending Queries', value: response.data.queries, icon: '❓' },
            { label: 'Blog Posts', value: response.data.blogs, icon: '📝' },
            { label: 'Partners', value: response.data.partners, icon: '🤝' }
          ];
        }
      },
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  loadRecentStudents() {
    this.adminService.getStudents().subscribe({
      next: (response) => {
        if (response.success) {
          this.recentStudents = response.data.slice(0, 5);
        }
      },
      error: (error) => console.error('Error loading recent students:', error)
    });
  }

  loadRecentQueries() {
    this.adminService.getQueries().subscribe({
      next: (response) => {
        if (response.success) {
          this.recentQueries = response.data.slice(0, 5);
        }
      },
      error: (error) => console.error('Error loading recent queries:', error)
    });
  }
}

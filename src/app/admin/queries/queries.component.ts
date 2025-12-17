import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-queries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent implements OnInit {
  queries: any[] = [];
  selectedQuery: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadQueries();
  }

  loadQueries() {
    this.adminService.getQueries().subscribe({
      next: (resp: any) => {
        if (resp && resp.success) {
          this.queries = resp.data || [];
        }
      },
      error: (err) => console.error('Failed loading queries', err)
    });
  }

  viewQuery(q: any) {
    this.selectedQuery = q;
  }

  closeView() {
    this.selectedQuery = null;
  }

  replyQuery(q: any) {
    if (q && q.email) {
      const subject = encodeURIComponent(q.subject || 'Re: Your query');
      const body = encodeURIComponent(`\n\n----\nOriginal message:\n${q.message || ''}`);
      // open default mail client
      window.location.href = `mailto:${q.email}?subject=${subject}&body=${body}`;
    } else {
      alert('No email address available for this query.');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  certificates: any[] = [];
  students: any[] = [];
  courses: any[] = [];

  formVisible = false;
  form: any = { student_id: null, course_id: null, issue_date: new Date().toISOString().slice(0,10), status: 'Issued' };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadCertificates();
    this.loadStudents();
    this.loadCourses();
  }

  loadCertificates() {
    this.adminService.getCertificates().subscribe({
      next: (res) => { if (res.success) this.certificates = res.data; },
      error: (err) => console.error('Error loading certificates', err)
    });
  }

  loadStudents() {
    this.adminService.getStudents().subscribe({ next: (res) => { if (res.success) this.students = res.data; }, error: (e) => console.error(e) });
  }

  loadCourses() {
    this.adminService.getCourses().subscribe({ next: (res) => { if (res.success) this.courses = res.data; }, error: (e) => console.error(e) });
  }

  trackById(index: number, item: any) { return item.id; }

  openCreate() { this.resetForm(); this.formVisible = true; }

  cancelForm() { this.formVisible = false; }

  resetForm() { this.form = { student_id: null, course_id: null, issue_date: new Date().toISOString().slice(0,10), status: 'Issued' }; }

  async save() {
    const payload = {
      student_id: this.form.student_id,
      course_id: this.form.course_id,
      issue_date: this.form.issue_date,
      status: this.form.status
    };
    this.adminService.addCertificate(payload).subscribe({
      next: (res) => { this.loadCertificates(); this.formVisible = false; },
      error: (err) => { console.error('Issue certificate failed', err); alert('Failed to issue certificate'); }
    });
  }
}

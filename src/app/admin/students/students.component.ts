import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
  courses: any[] = [];

  formVisible = false;
  isEditing = false;
  form: any = { id: null, name: '', email: '', phone: '', course_id: null, status: 'Active' };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStudents();
    this.loadCourses();
  }

  loadStudents() {
    this.adminService.getStudents().subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data;
        }
      },
      error: (error) => console.error('Error loading students:', error)
    });
  }

  loadCourses() {
    this.adminService.getCourses().subscribe({
      next: (response) => {
        if (response.success) {
          this.courses = response.data;
        }
      },
      error: (err) => console.error('Error loading courses:', err)
    });
  }

  trackById(index: number, item: any) { return item.id; }

  openCreate() { this.resetForm(); this.isEditing = false; this.formVisible = true; }

  openEdit(student: any) { this.form = { id: student.id, name: student.name, email: student.email, phone: student.phone || '', course_id: student.course_id || null, status: student.status || 'Active' }; this.isEditing = true; this.formVisible = true; }

  cancelForm() { this.formVisible = false; this.resetForm(); }

  resetForm() { this.form = { id: null, name: '', email: '', phone: '', course_id: null, status: 'Active' }; }

  save() {
    const payload: any = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      course_id: this.form.course_id,
      status: this.form.status
    };
    if (this.isEditing && this.form.id) {
      this.adminService.updateStudent(this.form.id, payload).subscribe({
        next: () => { this.loadStudents(); this.formVisible = false; },
        error: () => alert('Update failed')
      });
    } else {
      this.adminService.addStudent(payload).subscribe({
        next: () => { this.loadStudents(); this.formVisible = false; },
        error: () => alert('Create failed')
      });
    }
  }

  confirmDelete(student: any) {
    if (confirm(`Delete student "${student.name}"?`)) {
      this.adminService.deleteStudent(student.id).subscribe({
        next: () => this.loadStudents(),
        error: () => alert('Delete failed')
      });
    }
  }
}

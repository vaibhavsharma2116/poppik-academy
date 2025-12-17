import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  formVisible = false;
  isEditing = false;
  form: any = {
    id: null,
    name: '',
    description: '',
    duration: '',
    category: 'Beauty',
    status: 'Active',
    image: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.adminService.getCourses().subscribe({
      next: (response) => {
        if (response.success) {
          this.courses = response.data;
        }
      },
      error: (error) => console.error('Error loading courses:', error)
    });
  }

    trackById(index: number, item: any) {
      return item.id;
    }

    openCreate() {
      this.resetForm();
      this.isEditing = false;
      this.formVisible = true;
    }

    openEdit(course: any) {
      this.form = { ...course };
      this.isEditing = true;
      this.formVisible = true;
    }

    cancelForm() {
      this.formVisible = false;
      this.resetForm();
    }

    resetForm() {
      this.form = { id: null, name: '', description: '', duration: '', category: 'Beauty', status: 'Active', image: '' };
    }

    save() {
      const payload: any = { ...this.form };
      if (this.isEditing && payload.id) {
        this.adminService.updateCourse(payload.id, payload).subscribe({
          next: () => { this.loadCourses(); this.formVisible = false; },
          error: () => alert('Update failed')
        });
      } else {
        this.adminService.addCourse(payload).subscribe({
          next: () => { this.loadCourses(); this.formVisible = false; },
          error: () => alert('Create failed')
        });
      }
    }

    confirmDelete(course: any) {
      if (confirm(`Delete course "${course.name}"?`)) {
        this.adminService.deleteCourse(course.id).subscribe({
          next: () => this.loadCourses(),
          error: () => alert('Delete failed')
        });
      }
    }

    onFileChange(event: any) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.form.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
}

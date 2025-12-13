import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-hero-sliders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-sliders.component.html',
  styleUrls: ['./hero-sliders.component.css']
})
export class HeroSlidersComponent implements OnInit {
  sliders: any[] = [];
  formVisible = false;
  isEditing = false;
  form: any = {
    id: null,
    title: '',
    subtitle: '',
    image: '',
    sort_order: 0,
    status: 'Active'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadSliders();
  }

  loadSliders() {
    this.adminService.getHeroSliders().subscribe({
      next: (response) => {
        if (response.success) {
          this.sliders = response.data;
        }
      },
      error: (error) => console.error('Error loading sliders:', error)
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

  openEdit(slider: any) {
    this.form = { ...slider };
    this.isEditing = true;
    this.formVisible = true;
  }

  cancelForm() {
    this.formVisible = false;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      id: null,
      title: '',
      subtitle: '',
      image: '',
      sort_order: 0,
      status: 'Active'
    };
  }

  save() {
    const payload: any = { ...this.form };
    if (this.isEditing && payload.id) {
      this.adminService.updateHeroSlider(payload.id, payload).subscribe({
        next: (res) => {
          this.loadSliders();
          this.formVisible = false;
        },
        error: (err) => alert('Update failed')
      });
    } else {
      // POST
      this.adminService.addHeroSlider(payload).subscribe({
        next: (res) => {
          this.loadSliders();
          this.formVisible = false;
        },
        error: (err) => alert('Create failed')
      });
    }
  }

  confirmDelete(slider: any) {
    if (confirm(`Delete slider "${slider.title}"?`)) {
      this.adminService.deleteHeroSlider(slider.id).subscribe({
        next: () => this.loadSliders(),
        error: () => alert('Delete failed')
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // store base64 string in image field
      this.form.image = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  images: any[] = [];
  categories: string[] = [];
  showModal = false;
  isEditMode = false;
  currentImage: any = {
    id: null,
    title: '',
    image: '',
    category: 'Beauty',
    sort_order: 0,
    status: 'Active'
  };
  selectedFile: File | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadGallery();
  }

  /**
   * Normalize an image path into a usable URL for the <img> src.
   * - If the path is empty, return a placeholder asset.
   * - If it's already an absolute URL (http, https, //) return as-is.
   * - If it begins with `/` (server upload path), prefix with current origin.
   */
  resolveImage(imagePath: string | null | undefined): string {
    const placeholder = 'assets/placeholder.png';
    if (!imagePath) return placeholder;
    const trimmed = (imagePath || '').trim();
    if (!trimmed) return placeholder;
    const lowered = trimmed.toLowerCase();
    if (lowered.startsWith('http://') || lowered.startsWith('https://') || lowered.startsWith('//')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
      return origin + trimmed;
    }
    return trimmed;
  }

  loadGallery() {
    this.adminService.getGallery().subscribe({
      next: (response) => {
        if (response.success) {
          this.images = response.data;
          // build unique category list from images
          const cats = this.images.map(i => (i.category || 'General').trim()).filter(Boolean);
          this.categories = Array.from(new Set(cats));
        }
      },
      error: (error) => console.error('Error loading gallery:', error)
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentImage = {
      id: null,
      title: '',
      image: '',
      category: 'Beauty',
      sort_order: 0,
      status: 'Active'
    };
    this.showModal = true;
  }

  openEditModal(image: any) {
    this.isEditMode = true;
    this.currentImage = { ...image };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveImage() {
    const finalizeSave = (imageUrl?: string) => {
      if (imageUrl) this.currentImage.image = imageUrl;
      if (this.isEditMode) {
        this.adminService.updateGalleryImage(this.currentImage.id, this.currentImage).subscribe({
          next: () => {
            this.loadGallery();
            this.closeModal();
            this.selectedFile = null;
          },
          error: (error) => console.error('Error updating image:', error)
        });
      } else {
        this.adminService.addGalleryImage(this.currentImage).subscribe({
          next: () => {
            this.loadGallery();
            this.closeModal();
            this.selectedFile = null;
          },
          error: (error) => console.error('Error adding image:', error)
        });
      }
    };

    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('image_file', this.selectedFile, this.selectedFile.name);
      this.adminService.uploadGalleryFile(fd).subscribe((resp: any) => {
        if (resp && resp.url) {
          finalizeSave(resp.url);
        } else {
          // fallback: still try to save without image url
          finalizeSave();
        }
      }, () => finalizeSave());
    } else {
      finalizeSave();
    }
  }

  // Use a public class property (arrow function) so the template type-checker
  // recognizes this handler consistently during AOT/NG compilation.
  public onFileSelected = (event: any): void => {
    const input = event && event.target as HTMLInputElement;
    const file: File | undefined = input && input.files ? input.files[0] : undefined;
    if (file) this.selectedFile = file;
  }

  deleteImage(id: number) {
    if (confirm('Are you sure you want to delete this image?')) {
      this.adminService.deleteGalleryImage(id).subscribe({
        next: () => this.loadGallery(),
        error: (error) => console.error('Error deleting image:', error)
      });
    }
  }
}

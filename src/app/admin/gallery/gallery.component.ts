
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
  defaultImage = 'https://via.placeholder.com/420x320?text=No+Image';
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

  loadGallery() {
    this.adminService.getGallery().subscribe({
      next: (response) => {
        if (response.success) {
          // normalize image URLs so the template can always use a valid src
          this.images = (response.data || []).map((it: any) => ({
            ...it,
            image: this.normalizeImageUrl(it.image)
          }));
          // build unique category list from images
          const cats = this.images.map(i => (i.category || 'General').trim()).filter(Boolean);
          this.categories = Array.from(new Set(cats));
        }
      },
      error: (error) => console.error('Error loading gallery:', error)
    });
  }

  normalizeImageUrl(url: string | null | undefined): string {
    const defaultImg = this.defaultImage;
    if (!url) return defaultImg;
    const trimmed = (url || '').trim();
    if (!trimmed) return defaultImg;
    if (/^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed)) return trimmed;
    // if the stored value already contains 'uploads' path, ensure it becomes an absolute URL to the PHP server
    const host = window.location.hostname || 'localhost';
    const port = '8000';
    const base = `${window.location.protocol}//${host}:${port}`;
    // remove any leading slashes
    const path = trimmed.replace(/^\/+/, '');
    // If path already looks like 'php-admin/uploads/...' or 'uploads/...', prefer to use it directly
    if (path.indexOf('uploads') !== -1 || path.indexOf('php-admin') !== -1) {
      return `${base}/${path}`;
    }
    // Fall back to assuming images are in php-admin/uploads/gallery/
    return `${base}/uploads/gallery/${path}`;
  }

  handleImageError(event: any) {
    try {
      (event.target as HTMLImageElement).src = this.defaultImage;
    } catch (e) {
      // ignore
    }
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
      // Ask the PHP upload endpoint to create the DB record immediately
      fd.append('create_record', '1');
      fd.append('title', this.currentImage.title || '');
      fd.append('category', this.currentImage.category || 'General');
      fd.append('sort_order', String(this.currentImage.sort_order || 0));
      fd.append('status', this.currentImage.status || 'Active');
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

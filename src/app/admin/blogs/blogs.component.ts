
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css']
})
export class BlogsComponent implements OnInit {
  blogs: any[] = [];
  categories: string[] = [];
  showModal = false;
  editMode = false;
  currentBlog: any = {
    id: null,
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    category: 'Beauty',
    status: 'Published'
  };
  selectedFile: File | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs() {
    this.adminService.getBlogs().subscribe({
      next: (response) => {
        if (response.success) {
          this.blogs = response.data;
          // build unique categories from existing blogs
          const cats = this.blogs.map(b => (b.category || 'General').trim()).filter(Boolean);
          this.categories = Array.from(new Set(cats));
        }
      },
      error: (error) => console.error('Error loading blogs:', error)
    });
  }

  openAddModal() {
    this.editMode = false;
    this.currentBlog = {
      id: null,
      title: '',
      excerpt: '',
      content: '',
      image: '',
      author: '',
      category: 'Beauty',
      status: 'Published'
    };
    this.showModal = true;
  }

  openEditModal(blog: any) {
    this.editMode = true;
    this.currentBlog = { ...blog };
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelected(event: any) {
    const file: File = event?.target?.files && event.target.files[0];
    if (file) this.selectedFile = file;
  }

  saveBlog() {
    const finalizeSave = () => {
      if (this.editMode) {
        console.log('[Blogs] Updating blog', this.currentBlog);
        this.adminService.updateBlog(this.currentBlog.id, this.currentBlog).subscribe({
          next: (resp) => {
            console.log('[Blogs] Update response', resp);
            this.loadBlogs();
            this.closeModal();
            this.selectedFile = null;
          },
          error: (error) => {
            console.error('Error updating blog:', error);
            alert('Error updating blog. Check console/network for details.');
          }
        });
      } else {
        console.log('[Blogs] Adding blog', this.currentBlog);
        this.adminService.addBlog(this.currentBlog).subscribe({
          next: (resp) => {
            console.log('[Blogs] Add response', resp);
            this.loadBlogs();
            this.closeModal();
            this.selectedFile = null;
          },
          error: (error) => {
            console.error('Error adding blog:', error);
            alert('Error adding blog. Check console/network for details.');
          }
        });
      }
    };

    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('image_file', this.selectedFile, this.selectedFile.name);
      // reuse gallery upload endpoint to store file and get URL
      this.adminService.uploadGalleryFile(fd).subscribe({
        next: (resp: any) => {
          console.log('[Blogs] uploadGalleryFile response', resp);
          if (resp && resp.url) {
            this.currentBlog.image = resp.url;
          } else {
            console.warn('[Blogs] uploadGalleryFile did not return url', resp);
          }
          finalizeSave();
        },
        error: (err) => {
          console.error('[Blogs] uploadGalleryFile error', err);
          alert('Image upload failed — blog will still be saved without image.');
          finalizeSave();
        }
      });
    } else {
      finalizeSave();
    }
  }

  deleteBlog(id: number) {
    if (confirm('Are you sure you want to delete this blog?')) {
      this.adminService.deleteBlog(id).subscribe({
        next: () => this.loadBlogs(),
        error: (error) => console.error('Error deleting blog:', error)
      });
    }
  }

  execCommand(command: string, value?: string) {
    document.execCommand(command, false, value || '');
  }

  onEditorBlur(event: any) {
    this.currentBlog.content = event.target.innerHTML;
  }

  addLink() {
    const url = prompt('Enter the URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }
}

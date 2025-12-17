
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-video-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  templateUrl: './video-hub.component.html',
  styleUrls: ['./video-hub.component.css']
})
export class VideoHubComponent implements OnInit {
  videos: any[] = [];
  showModal = false;
  isEditing = false;
  // playback state for admin list/modal
  playingVideoId: number | null = null;
  playingVideo: any = null;
  showPlayModal = false;
  isYouTubeAdmin = false;
  youtubeEmbedUrlAdmin: string = '';

  videoForm = {
    id: null,
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
    category: 'Beauty',
    duration: '',
    status: 'Active'
  };

  videoFile: File | null = null;
  thumbnailFile: File | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.adminService.getVideos().subscribe({
      next: (response) => {
        if (response.success) {
          // Normalize thumbnails and video URLs to absolute paths so players can load them
          const backendHost = window.location.hostname || 'localhost';
          const backendPort = '8000';
          const backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
          this.videos = (response.data || []).map((v: any) => {
            const thumb = v.thumbnail || '';
            const vidUrl = v.video_url || v.videoUrl || '';
            return {
              ...v,
              thumbnail: this.normalizeUrl(thumb, backendBase) || thumb,
              video_url: this.normalizeUrl(vidUrl, backendBase) || vidUrl
            };
          });
        }
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        alert('Failed to load videos');
      }
    });
  }

  // Helper to make relative URLs absolute pointing to backend
  private normalizeUrl(url: string, backendBase: string): string {
    if (!url) return '';
    url = String(url).replace(/\\/g, '/');
    // If already absolute
    if (/^https?:\/\//i.test(url)) return url;
    // Remove possible leading /php-admin prefix
    url = url.replace('/php-admin', '');
    if (url.charAt(0) !== '/') url = '/' + url;
    return backendBase + url;
  }

  playVideo(video: any) {
    if (!video) return;
    this.playingVideoId = video.id;
    this.playingVideo = video;
    this.showPlayModal = true;

    // normalize URL if necessary
    let url = video.video_url || video.videoUrl || '';
    if (url && !/^https?:\/\//i.test(url)) {
      const backendHost = window.location.hostname || 'localhost';
      const backendPort = '8000';
      const backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
      if (url.charAt(0) !== '/') url = '/' + url;
      url = backendBase + url;
    }

    // If it's a YouTube URL, set embed URL
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
    const match = String(url).match(youtubeRegex);
    if (match && match[1]) {
      this.isYouTubeAdmin = true;
      const videoId = match[1].split(/[&?]/)[0];
      // autoplay and mute to allow autoplay in modal
      this.youtubeEmbedUrlAdmin = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
      // keep original video.video_url for fallback
    } else {
      this.isYouTubeAdmin = false;
      // ensure the video object's video_url is set to the normalized URL so <video> can use it
      if (url) video.video_url = url;
      this.youtubeEmbedUrlAdmin = '';
    }
    // prevent background scroll while playing
    // Prevent background scroll (inline style so it applies globally)
    try { document.body.style.overflow = 'hidden'; } catch(e) {}
  }

  stopVideo() {
    this.playingVideoId = null;
    this.playingVideo = null;
    this.showPlayModal = false;
    this.isYouTubeAdmin = false;
    this.youtubeEmbedUrlAdmin = '';
    try { document.body.style.overflow = ''; } catch(e) {}
  }

  openAddModal() {
    this.isEditing = false;
    this.videoForm = {
      id: null,
      title: '',
      description: '',
      video_url: '',
      thumbnail: '',
      category: 'Beauty',
      duration: '',
      status: 'Active'
    };
    this.videoFile = null;
    this.thumbnailFile = null;
    this.showModal = true;
  }

  editVideo(video: any) {
    this.isEditing = true;
    this.videoForm = { ...video };
    this.videoFile = null;
    this.thumbnailFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveVideo() {
    if (!this.videoForm.title) {
      alert('Please enter a title');
      return;
    }

    const finalizeSave = () => {
      if (this.isEditing) {
        this.adminService.updateVideo(this.videoForm.id!, this.videoForm).subscribe({
          next: (response) => {
            if (response.success) {
              alert('Video updated successfully!');
              this.loadVideos();
              this.closeModal();
            }
          },
          error: (error) => {
            console.error('Error updating video:', error);
            alert('Failed to update video');
          }
        });
      } else {
        this.adminService.addVideo(this.videoForm).subscribe({
          next: (response) => {
            if (response.success) {
              alert('Video added successfully!');
              this.loadVideos();
              this.closeModal();
            }
          },
          error: (error) => {
            console.error('Error adding video:', error);
            alert('Failed to add video');
          }
        });
      }
    };

    // Upload video file if selected
    if (this.videoFile) {
      const fd = new FormData();
      fd.append('video_file', this.videoFile, this.videoFile.name);
      this.adminService.uploadGalleryFile(fd).subscribe({
        next: (resp: any) => {
          if (resp && resp.url) this.videoForm.video_url = resp.url;
          this.uploadThumbnail(finalizeSave);
        },
        error: () => this.uploadThumbnail(finalizeSave)
      });
    } else {
      this.uploadThumbnail(finalizeSave);
    }
  }

  uploadThumbnail(callback: () => void) {
    if (this.thumbnailFile) {
      const fd = new FormData();
      fd.append('image_file', this.thumbnailFile, this.thumbnailFile.name);
      this.adminService.uploadGalleryFile(fd).subscribe({
        next: (resp: any) => {
          if (resp && resp.url) this.videoForm.thumbnail = resp.url;
          callback();
        },
        error: () => callback()
      });
    } else {
      callback();
    }
  }

  onVideoFileSelected(event: any) {
    const file: File = event?.target?.files && event.target.files[0];
    if (file) this.videoFile = file;
  }

  onThumbnailFileSelected(event: any) {
    const file: File = event?.target?.files && event.target.files[0];
    if (file) this.thumbnailFile = file;
  }

  deleteVideo(id: number) {
    if (confirm('Are you sure you want to delete this video?')) {
      this.adminService.deleteVideo(id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Video deleted successfully!');
            this.loadVideos();
          }
        },
        error: (error) => {
          console.error('Error deleting video:', error);
          alert('Failed to delete video');
        }
      });
    }
  }
}

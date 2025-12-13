import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { SafePipe } from '../pipes/safe.pipe';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SafePipe],
  styles: [
    `
    .video-container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .back-link { display: inline-block; margin-bottom: 20px; color: #D4A574; text-decoration: none; cursor: pointer; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }

    .video-player { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin-bottom: 30px; background: #000; }
    .video-player iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
    .video-player video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

    .video-info { background: #fff; border-radius: 12px; padding: 30px; }
    .video-title { font-size: 2rem; margin: 0 0 12px; color: #111; font-weight: 700; }
    .meta { color: #888; font-size: 0.95rem; margin-bottom: 12px; }
    .meta span { margin-right: 16px; }
    .meta .badge { display: inline-block; background: #D4A574; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; }

    .description { color: #333; line-height: 1.8; margin: 20px 0; font-size: 1rem; }

    .video-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .stat { padding: 15px; background: #f9f9f9; border-radius: 8px; }
    .stat-label { color: #888; font-size: 0.9rem; }
    .stat-value { font-size: 1.3rem; color: #111; font-weight: 600; }

    @media (max-width: 700px) {
      .video-title { font-size: 1.5rem; }
      .video-stats { grid-template-columns: 1fr; }
    }
    `
  ],
  template: `
  <div class="video-container" *ngIf="video; else loading">
    <a [routerLink]="['/']" class="back-link">← Back to Home</a>

    <div class="video-player">
      <!-- YouTube embed if it's a YouTube URL -->
      <iframe *ngIf="isYouTube"
        [src]="youtubeEmbedUrl | safe"
        allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">
      </iframe>

      <!-- HTML5 video player for uploaded videos -->
      <video *ngIf="!isYouTube && video.video_url" controls>
        <source [src]="video.video_url" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>

    <div class="video-info">
      <h1 class="video-title">{{ video.title }}</h1>

      <div class="meta">
        <span class="badge">{{ video.category }}</span>
        <span>Duration: {{ video.duration || 'N/A' }}</span>
      </div>

      <p class="description">{{ video.description }}</p>

      <div class="video-stats">
        <div class="stat">
          <div class="stat-label">Category</div>
          <div class="stat-value">{{ video.category }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Status</div>
          <div class="stat-value">{{ video.status }}</div>
        </div>
      </div>
    </div>
  </div>

  <ng-template #loading>
    <div class="video-container"><p>Loading video...</p></div>
  </ng-template>
  `
})
export class VideoDetailComponent implements OnInit {
  video: any = null;
  isYouTube = false;
  youtubeEmbedUrl: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private adminService: AdminService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // Fetch all videos and find the one with matching id
    this.adminService.getVideos().subscribe({
      next: (resp) => {
        if (resp && resp.success && Array.isArray(resp.data)) {
          const found = resp.data.find((v: any) => String(v.id) === String(id));
          if (found) {
            this.video = found;
            this.processVideoUrl();
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  processVideoUrl() {
    if (!this.video.video_url) return;

    // Check if it's a YouTube URL
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
    const match = this.video.video_url.match(youtubeRegex);

    if (match && match[1]) {
      this.isYouTube = true;
      const videoId = match[1].split(/[&?]/)[0];
      this.youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
      this.isYouTube = false;
    }
  }
}

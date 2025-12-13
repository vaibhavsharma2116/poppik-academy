import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [
    `
    .header { width: 100%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
    .header-content { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
    .logo { cursor: pointer; display: flex; gap: 8px; text-decoration: none; font-size: 24px; font-weight: 700; }
    .logo-text { color: #333; }
    .logo-accent { color: #D4A574; }
    .nav { display: flex; gap: 30px; align-items: center; }
    .nav a { cursor: pointer; color: #333; text-decoration: none; font-size: 15px; font-weight: 500; position: relative; transition: color 0.3s; }
    .nav a:hover { color: #D4A574; }
    .nav a::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #D4A574; transition: width 0.3s; }
    .nav a:hover::after { width: 100%; }
    .nav-cta { background: #D4A574; color: white; padding: 10px 24px; border-radius: 6px; font-weight: 600; }
    .nav-cta:hover { background: #c29460; color: white; }
    .nav-cta::after { display: none; }
    .menu-toggle { display: none; flex-direction: column; gap: 6px; background: none; border: none; cursor: pointer; padding: 0; }
    .menu-toggle span { width: 24px; height: 2px; background: #333; transition: 0.3s; }
    @media (max-width: 768px) {
      .menu-toggle { display: flex; }
      .nav { position: absolute; top: 60px; left: 0; right: 0; background: white; flex-direction: column; gap: 15px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 0; overflow: hidden; transition: max-height 0.3s; }
      .nav.active { max-height: 400px; }
      .nav a { padding: 10px 0; }
    }
    .blog-hero { width: 100%; margin: 0; padding: 0; }
    .blog-hero img { width: 100%; height: auto; max-height: 600px; object-fit: cover; display: block; }
    .container.blog-detail { max-width: 980px; margin: 28px auto; padding: 0 18px; }
    .back-link { display:inline-block; margin:12px 0; color:#666; text-decoration:none; cursor:pointer; }
    .back-link:hover { color:#333; }
    .detail-header { margin: 18px 0 8px; }
    .detail-title { font-size: 2.5rem; margin: 6px 0 8px; line-height:1.15; color:#111; font-weight:700; }
    .meta { color:#888; font-size:0.95rem; margin-bottom:12px; }
    .meta .author { margin-right: 12px; font-weight:600; color:#333; }
    .excerpt { background:#f7f7f9; border-left:4px solid #D4A574; padding:16px; margin: 12px 0 20px; color:#333; font-size:1.05rem; line-height:1.7; }
    .content { color:#222; line-height:1.8; font-size:1rem; }
    .content p { margin-bottom:16px; }
    .content h2 { font-size:1.8rem; margin: 24px 0 12px; color:#111; }
    .content h3 { font-size:1.4rem; margin: 20px 0 10px; color:#222; }
    .content ul, .content ol { margin: 12px 0 12px 24px; }
    .content li { margin-bottom:8px; }
    @media (max-width: 900px) { .detail-title { font-size:2rem; } }
    @media (max-width: 700px) { .blog-hero img { max-height: 300px; } .detail-title { font-size:1.5rem; } .excerpt { padding:12px; font-size:0.95rem; } }
    `
  ],
  template: `
  <header class="header">
    <div class="container header-content">
      <a class="logo" [routerLink]="['/']">
        <span class="logo-text">Poppik</span>
        <span class="logo-accent">Academy</span>
      </a>

      <button class="menu-toggle" (click)="toggleMenu()">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="nav" [class.active]="isMenuOpen">
        <a [routerLink]="['/']" (click)="isMenuOpen = false">Home</a>
        <a href="#about" (click)="isMenuOpen = false">About</a>
        <a href="#courses" (click)="isMenuOpen = false">Courses</a>
        <a href="#blog" (click)="isMenuOpen = false">Blog</a>
        <a href="#contact" class="nav-cta" (click)="isMenuOpen = false">Contact Us</a>
      </nav>
    </div>
  </header>

  <div *ngIf="blog; else loading">
    <div class="blog-hero">
      <img *ngIf="blog.image" [src]="blog.image" [alt]="blog.title">
    </div>

    <div class="container blog-detail">
      <a [routerLink]="['/']" class="back-link">← Back</a>
      <div class="detail-header">
        <h1 class="detail-title">{{ blog.title }}</h1>
        <div class="meta">
          <span class="author">By {{ blog.author || 'Poppik Lifestyle' }}</span>
          <span class="date">{{ blog.date }}</span>
          <span *ngIf="blog.category"> • {{ blog.category }}</span>
        </div>
      </div>

      <p *ngIf="blog.excerpt" class="excerpt">{{ blog.excerpt }}</p>

      <div class="content" [innerHTML]="sanitizedContent"></div>
    </div>
  </div>
  <ng-template #loading>
    <div class="container blog-detail"><p>Loading article...</p></div>
  </ng-template>
  `
})
export class BlogDetailComponent implements OnInit {
  blog: any = null;
  sanitizedContent: SafeHtml | null = null;
  isMenuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // Try to fetch all blogs then find the one with the matching id (API doesn't have a single-blog endpoint)
    this.adminService.getBlogs().subscribe({
      next: (resp) => {
        if (resp && resp.success && Array.isArray(resp.data)) {
          const found = resp.data.find((b: any) => String(b.id) === String(id));
          if (found) {
            let backendBase = 'http://localhost:8000';
            if (isPlatformBrowser(this.platformId)) {
              const backendHost = window.location.hostname || 'localhost';
              const backendPort = '8000';
              backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
            }
            const image = found.image ? this.normalizeImageUrl(found.image, backendBase) : '';
            this.blog = {
              id: found.id,
              title: found.title,
              content: found.content,
              excerpt: found.excerpt,
              author: found.author || found.author_name || 'Poppik Lifestyle',
              category: found.category,
              date: new Date(found.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              image
            };
            // Sanitize HTML content for binding. Only bypass security for
            // content you trust from the backend.
            this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.blog.content || '');
          } else {
            // not found -> redirect to home
            this.router.navigate(['/']);
          }
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private normalizeImageUrl(url: string, backendBase: string): string {
    if (!url) return '';
    url = url.replace(/\\/g, '/');
    url = url.replace('/php-admin', '');
    // If the URL contains the uploads path, return a relative path
    // like `/uploads/...` so the browser requests it from the current
    // origin. This avoids hard-coding `localhost:8000` which may not be
    // available in the environment the frontend is served from.
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const uploadsPath = url.slice(uploadsIndex);
      // Ensure the image is requested from the backend server where uploads are served.
      // This prefixes the uploads path with the backend base (including host and port).
      return backendBase.replace(/\/$/, '') + uploadsPath;
    }

    // If it's an absolute URL to another host, keep it as-is.
    if (/^https?:\/\//i.test(url)) return url;

    if (url.charAt(0) !== '/') url = '/' + url;
    return backendBase + url;
  }
}

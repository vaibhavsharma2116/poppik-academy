
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { SafePipe } from '../pipes/safe.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SafePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentSlide = 0;
  isMenuOpen = false;
  certificateId = '';
  verificationResult: any = null;

  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  slides: any[] = [];
  courses: any[] = [];

  highlights = [
    { icon: '👨‍🏫', title: 'Industry-Expert Trainers', description: 'Learn directly from certified professionals and specialists.' },
    { icon: '📚', title: 'Future-Ready Curriculum', description: 'Updated modules designed around real industry needs.' },
    { icon: '🎯', title: '100% Practical Learning', description: 'Perfect balance of hands-on skills and core knowledge.' },
    { icon: '💼', title: 'Career & Business Support', description: 'Guidance for jobs, freelancing, and entrepreneurship.' },
    { icon: '🏢', title: 'Premium Environment', description: 'Modern setup, high-quality tools, and professional atmosphere.' },
    { icon: '🏆', title: 'Valued Certification', description: 'Credentials recognized across beauty, lifestyle, and wellness.' },
    { icon: '🌟', title: 'Holistic Growth', description: 'Communication, grooming, and professional ethics training.' }
  ];

  careers = {
    beauty: ['Makeup Artist', 'Hair Stylist', 'Skin Care Specialist', 'Salon Professional', 'Beauty Consultant', 'Bridal Specialist', 'Cosmetology Assistant'],
    lifestyle: ['Personal Grooming Expert', 'Image Consultant', 'Lifestyle Coach', 'Fashion & Personal Styling Assistant', 'Social Media Personality / Content Creator', 'Professional Etiquette Trainer'],
    wellness: ['Wellness Coach', 'Yoga & Fitness Assistant', 'Mental Wellness Guide', 'Nutrition & Healthy Lifestyle Mentor', 'Spa & Wellness Center Associate']
  };

  careerSupport = [
    { icon: '📋', title: '100% Placement Assistance', description: 'Access opportunities with leading salons, studios, brands, and wellness centers.' },
    { icon: '🎯', title: 'Career Counselling', description: 'One-on-one sessions to choose the right career direction.' },
    { icon: '📄', title: 'Resume & Portfolio Building', description: 'We help you create a professional identity that stands out.' },
    { icon: '🎤', title: 'Interview Training', description: 'Communication, grooming, confidence, and answer preparation.' },
    { icon: '💡', title: 'Freelancing & Business Mentoring', description: 'Learn how to find clients, build packages, and grow your brand.' },
    { icon: '🎓', title: 'Certification for Better Opportunities', description: 'Industry-recognized certification that adds value to your profile.' }
  ];

  blogs: any[] = [];

  videos: any[] = [];

  partners: any[] = [];

  galleryImages: any[] = [];

  // selected image for gallery modal
  public gallerySelectedImage: string | null = null;

  // selected course for modal
  selectedCourse: any = null;
  // selected video for inline modal
  selectedVideoForModal: any = null;
  isYouTubeModal = false;
  youtubeEmbedUrlModal = '';

  constructor(private adminService: AdminService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadHeroSliders();
    this.loadCourses();
    this.loadGallery();
    this.loadPartners();
    this.loadBlogs();
    this.loadVideos();
  }

  loadVideos() {
    this.adminService.getVideos().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          let backendBase = 'http://localhost:8000';
          if (isPlatformBrowser(this.platformId)) {
            const backendHost = window.location.hostname || 'localhost';
            const backendPort = '8000';
            backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
          }

          this.videos = response.data.slice(0, 3).map((v: any) => ({
            id: v.id,
            title: v.title,
            description: v.description,
            category: v.category,
            duration: v.duration,
            thumbnail: this.normalizeImageUrl(v.thumbnail || '', backendBase) || 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400',
            video_url: this.normalizeImageUrl(v.video_url || v.videoUrl || '', backendBase) || v.video_url || v.videoUrl || ''
          }));
        } else {
          this.setDefaultVideos();
        }
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.setDefaultVideos();
      }
    });
  }

  setDefaultVideos() {
    this.videos = [
      { category: 'Beauty', title: 'Professional Bridal Makeup Tutorial', duration: '15:30', thumbnail: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400' },
      { category: 'Lifestyle', title: 'Personal Branding Masterclass', duration: '22:45', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' },
      { category: 'Wellness', title: 'Morning Yoga Routine for Beginners', duration: '18:00', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400' }
    ];
  }

  loadGallery() {
    this.adminService.getGallery().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          let backendBase = 'http://localhost:8000';
          if (isPlatformBrowser(this.platformId)) {
            const backendHost = window.location.hostname || 'localhost';
            const backendPort = '8000';
            backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
          }
          this.galleryImages = response.data.map((item: any) => this.normalizeImageUrl(item.image, backendBase));
        } else {
          this.setDefaultGallery();
        }
      },
      error: (error) => {
        console.error('Error loading gallery:', error);
        this.setDefaultGallery();
      }
    });
  }

  setDefaultGallery() {
    this.galleryImages = [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400'
    ];
  }

  loadPartners() {
    this.adminService.getPartners().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          let backendBase = 'http://localhost:8000';
          if (isPlatformBrowser(this.platformId)) {
            const backendHost = window.location.hostname || 'localhost';
            const backendPort = '8000';
            backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
          }
          this.partners = response.data.map((p: any) => ({ ...p, logo: this.normalizeImageUrl(p.logo, backendBase) }));
        } else {
          this.setDefaultPartners();
        }
      },
      error: (error) => {
        console.error('Error loading partners:', error);
        this.setDefaultPartners();
      }
    });
  }

  setDefaultPartners() {
    this.partners = [
      { name: 'Lakme Salon', logo: '', website: '' },
      { name: 'VLCC', logo: '', website: '' },
      { name: 'Naturals', logo: '', website: '' },
      { name: 'Jawed Habib', logo: '', website: '' },
      { name: 'Green Trends', logo: '', website: '' },
      { name: 'YLG Salon', logo: '', website: '' }
    ];
  }

  loadBlogs() {
    this.adminService.getBlogs().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          // ensure image URLs are absolute so the browser can load them
          let backendBase = 'http://localhost:8000';
          if (isPlatformBrowser(this.platformId)) {
            const backendHost = window.location.hostname || 'localhost';
            const backendPort = '8000';
            backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;
          }

          this.blogs = response.data.slice(0, 3).map((blog: any) => {
            let img = this.normalizeImageUrl(blog.image || '', backendBase) || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400';
            return {
              category: blog.category,
              title: blog.title,
              excerpt: blog.excerpt,
                id: blog.id,
                content: blog.content || '',
              date: new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              image: img
            };
          });
        } else {
          this.setDefaultBlogs();
        }
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.setDefaultBlogs();
      }
    });
  }

  setDefaultBlogs() {
    this.blogs = [
      { category: 'Beauty', title: '10 Essential Makeup Tips for Beginners', excerpt: 'Master the basics of makeup application with these professional tips that will transform your beauty routine...', date: 'Nov 20, 2025', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' },
      { category: 'Lifestyle', title: 'Building Confidence Through Personal Grooming', excerpt: 'Discover how personal grooming impacts your professional presence and opens doors to new opportunities...', date: 'Nov 18, 2025', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
      { category: 'Wellness', title: 'Mindfulness Practices for Daily Balance', excerpt: 'Simple mindfulness techniques to incorporate into your routine for better mental and emotional wellbeing...', date: 'Nov 15, 2025', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400' }
    ];
  }

  // Ensure the image URL is loadable by the browser.
  // - Remove any '/php-admin' segment if present (common when backend stored paths with that prefix)
  // - If the value is relative, prefix it with the backend base URL
  private normalizeImageUrl(url: string, backendBase: string): string {
    if (!url) return '';
    // decode any escaped slashes
    url = url.replace(/\\/g, '/');
    // remove php-admin prefix if present
    url = url.replace('/php-admin', '');
    // if already absolute, return as-is
    if (/^https?:\/\//i.test(url)) return url;
    // ensure leading slash
    if (url.charAt(0) !== '/') url = '/' + url;
    return backendBase + url;
  }

  loadHeroSliders() {
    this.adminService.getHeroSliders().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.slides = response.data.map((slider: any) => {
            let imageUrl = slider.image || '';

            // If it's a base64 data URI, use it directly
            if (imageUrl.startsWith('data:image')) {
              return {
                id: slider.id,
                image: imageUrl
              };
            }

            // Otherwise, normalize the URL
            const backendHost = window.location.hostname || 'localhost';
            const backendPort = '8000';
            const backendBase = window.location.protocol + '//' + backendHost + ':' + backendPort;

            return {
              id: slider.id,
              image: this.normalizeImageUrl(imageUrl, backendBase) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop'
            };
          });
          this.startSlideshow();
        } else {
          // Fallback to default slides if no data
          this.setDefaultSlides();
          this.startSlideshow();
        }
      },
      error: (error) => {
        console.error('Error loading sliders:', error);
        this.setDefaultSlides();
        this.startSlideshow();
      }
    });
  }

  loadCourses() {
    this.adminService.getCourses().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.courses = response.data.map((course: any) => {
            const id = course.id || course.course_id || null;
            const slug = course.slug || (course.name ? this.slugify(course.name) : null);
            const detailsUrl = id ? ['/courses', id] : (slug ? ['/courses', slug] : ['/courses']);
            return {
              id,
              icon: this.getCourseIcon(course.category),
              title: course.name,
              duration: course.duration || 'Contact for details',
              level: 'All Levels',
              category: course.category || 'General',
              description: course.description || 'Course details coming soon.',
              detailsUrl,
              buttonText: course.button_text || course.cta || 'Learn More'
            };
          });
        } else {
          this.setDefaultCourses();
        }
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.setDefaultCourses();
      }
    });
  }

  getCourseIcon(category: string): string {
    const icons: any = {
      'Beauty': '💄',
      'Lifestyle': '✨',
      'Wellness': '🧘',
      'Hair': '💇',
      'Skin': '🌸',
      'Nail': '💅'
    };
    return icons[category] || '📚';
  }

  setDefaultSlides() {
    this.slides = [

    ];
  }

  setDefaultCourses() {
    this.courses = [
      { id: null, icon: '💄', title: 'Professional Makeup Artistry', duration: '3 Months', level: 'Beginner to Advanced', category: 'Beauty', detailsUrl: ['/courses'], buttonText: 'Learn More' }
    ];
  }

  // Create a URL-friendly slug from a course name
  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')          // Replace & with 'and'
      .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric and -
      .replace(/-+/g, '-');            // Replace multiple - with single -
  }

  startSlideshow() {
    setInterval(() => {
      if (this.slides.length > 0) {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      }
    }, 5000);
  }

  // Open video inline modal instead of navigating away
  openVideoModal(video: any) {
    this.selectedVideoForModal = video;
    this.processVideoForModal();
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
  }

  closeVideoModal() {
    this.selectedVideoForModal = null;
    this.isYouTubeModal = false;
    this.youtubeEmbedUrlModal = '';
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  private processVideoForModal() {
    if (!this.selectedVideoForModal) return;
    const url = this.selectedVideoForModal.video_url || this.selectedVideoForModal.videoUrl || '';
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
    const match = String(url).match(youtubeRegex);
    if (match && match[1]) {
      this.isYouTubeModal = true;
        const videoId = match[1].split(/[&?]/)[0];
        // autoplay and mute for autoplay to work across browsers
        this.youtubeEmbedUrlModal = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
    } else {
      this.isYouTubeModal = false;
      this.youtubeEmbedUrlModal = '';
    }
  }

  // Open the course modal
  openCourse(course: any) {
    this.selectedCourse = course;
    // optional: focus management or prevent background scroll
    document.body.classList.add('modal-open');
  }

  // Open gallery image modal
  public openGalleryImage(image: string): void {
    this.gallerySelectedImage = image;
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
  }

  // Close gallery image modal
  public closeGalleryModal(): void {
    this.gallerySelectedImage = null;
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  // Close the course modal
  closeCourse() {
    this.selectedCourse = null;
    document.body.classList.remove('modal-open');
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isMenuOpen = false;
  }

  verifyCertificate() {
    if (this.certificateId.trim()) {
      this.verificationResult = {
        valid: this.certificateId.toLowerCase().startsWith('pop'),
        id: this.certificateId,
        name: 'Sample Student',
        course: 'Professional Makeup Artistry',
        date: 'October 2025'
      };
    }
  }

  submitContact() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      alert('Please fill name, email and message before submitting.');
      return;
    }

    const payload = {
      name: this.contactForm.name,
      email: this.contactForm.email,
      phone: this.contactForm.phone || '',
      subject: '',
      message: this.contactForm.message
    };

    this.adminService.addQuery(payload).subscribe({
      next: (resp: any) => {
        if (resp && resp.success) {
          alert('Thank you — your message was submitted. We will get back to you soon.');
          this.contactForm = { name: '', email: '', phone: '', message: '' };
        } else {
          alert('Failed to submit message. Please try again.');
        }
      },
      error: (err) => {
        console.error('Error submitting query:', err);
        alert('Failed to submit message. Please try again later.');
      }
    });
  }
}

# Poppik Academy Website

## Overview

A professional single-page website for Poppik Academy - a modern, skill-focused training institution dedicated to the Beauty, Lifestyle, and Wellness industries. Includes a complete PHP admin panel for content management.

## Tech Stack

### Frontend (Angular)
- **Framework**: Angular 17+ (Standalone Components)
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Playfair Display + Poppins (Google Fonts)
- **Icons**: Google Material Icons
- **Build Tool**: Angular CLI with Vite

### Admin Panel (PHP)
- **Backend**: PHP 8.2 with built-in server
- **Database**: SQLite (database.sqlite)
- **Styling**: Custom CSS matching homepage theme

## Project Structure

```
php-admin/                    # PHP Admin Panel
  config.php                  # Database connection & schema
  database.sqlite             # SQLite database file
  index.php                   # Dashboard with stats
  courses.php                 # Courses CRUD
  students.php                # Students CRUD
  certificates.php            # Certificates CRUD
  queries.php                 # Queries management
  hero-sliders.php            # Hero sliders CRUD
  gallery.php                 # Gallery CRUD
  blogs.php                   # Blogs CRUD
  video-hub.php               # Videos CRUD
  partners.php                # Partners CRUD
  settings.php                # Site settings
  includes/
    header.php                # Sidebar & navigation
    footer.php                # Footer template
  assets/
    css/admin.css             # Admin styling
    js/admin.js               # Modal & utility functions

src/                          # Angular Frontend
  app/
    home/                     # Public homepage
    policies/                 # Policies page
    app.component.*           # Root component
    app.config.ts             # Application configuration
    app.routes.ts             # Main routes
  styles.css                  # Global styles and design system
  index.html                  # Entry HTML
```

## Website Sections (Public)

1. **Home** - Hero section with animated slider (4 slides)
2. **About Us** - Mission, Vision, and Why Choose Us
3. **Courses** - 9 courses in Beauty, Lifestyle, and Wellness
4. **Gallery** - Image grid showcase
5. **Highlights** - 7 advantage cards
6. **Job Placement** - Career support features and partner logos
7. **Careers** - Career paths across three industries
8. **Blog** - Latest blog posts with categories
9. **Video Hub** - Tutorial videos
10. **Certificate Verification** - Form to verify certificates
11. **Contact** - Contact form and information
12. **Footer** - Quick links and policies

## Admin Panel (/admin)

The admin panel provides a dashboard for managing the website content:

- **Dashboard** - Overview with stats cards and recent activity tables
- **Courses** - Manage course offerings
- **Students** - Manage enrolled students
- **Certificates** - Issue and manage certificates
- **Queries** - Handle user inquiries
- **Hero Sliders** - Manage homepage sliders
- **Gallery** - Upload and manage gallery images
- **Blogs** - Create and edit blog posts
- **Video Hub** - Manage video content
- **Partners** - Manage partner logos and info
- **Settings** - Site-wide settings

## Design System

### Colors
- Primary: `#D4A574` (Gold accent)
- Secondary: `#2C3E50` (Dark blue)
- Accent: `#E8D5C4` (Light cream)
- Background: `#FAF8F5` (Warm white)

### Typography
- Headings: Playfair Display (serif)
- Body: Poppins (sans-serif)

## Development

### Run Development Server
```bash
npm start
```
Server runs on port 5000.

### Build for Production
```bash
npx ng build --configuration production
```

## Routes

- `/` - Homepage
- `/policies` - Terms and policies
- `/admin` - Admin panel (redirects to dashboard)
- `/admin/dashboard` - Admin dashboard
- `/admin/courses` - Courses management
- `/admin/students` - Students management
- `/admin/certificates` - Certificates management
- `/admin/queries` - Queries management
- `/admin/hero-sliders` - Hero sliders management
- `/admin/gallery` - Gallery management
- `/admin/blogs` - Blogs management
- `/admin/video-hub` - Video hub management
- `/admin/partners` - Partners management
- `/admin/settings` - Settings

## Recent Changes

- **Nov 28, 2025**: Added complete admin panel with dashboard and all management sections
- **Nov 27, 2025**: Initial website creation with all 12 sections
- Disabled SSR for development mode for faster builds
- Implemented responsive design for all screen sizes

## Contact Information

- **Grievance Officer**: Hanmnt Dadas
- **Email**: hanmnt@poppik.in
- **Phone**: +91-7039011291

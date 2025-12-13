-- MySQL dump for poppik_academy
-- Creates database, tables and inserts sample data

DROP DATABASE IF EXISTS `poppik_academy`;
CREATE DATABASE IF NOT EXISTS `poppik_academy` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `poppik_academy`;

-- Tables
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `duration` VARCHAR(100),
  `category` VARCHAR(100),
  `status` VARCHAR(50) DEFAULT 'Active',
  `image` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `course_id` INT,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `student_id` INT,
  `course_id` INT,
  `certificate_code` VARCHAR(255) UNIQUE,
  `issue_date` DATE,
  `status` VARCHAR(50) DEFAULT 'Issued',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `queries` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `subject` VARCHAR(255),
  `message` TEXT,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `hero_sliders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` TEXT,
  `image` LONGTEXT,
  `button_text` VARCHAR(255),
  `button_link` VARCHAR(255),
  `sort_order` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255),
  `image` TEXT NOT NULL,
  `category` VARCHAR(100),
  `sort_order` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT,
  `excerpt` TEXT,
  `image` TEXT,
  `author` VARCHAR(255),
  `category` VARCHAR(100),
  `status` VARCHAR(50) DEFAULT 'Draft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `videos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `video_url` TEXT,
  `thumbnail` TEXT,
  `category` VARCHAR(100),
  `duration` VARCHAR(50),
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `logo` TEXT,
  `website` VARCHAR(255),
  `description` TEXT,
  `sort_order` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `setting_key` VARCHAR(255) UNIQUE NOT NULL,
  `setting_value` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample data
INSERT INTO `courses` (`name`,`description`,`duration`,`category`,`status`,`image`) VALUES
('Professional Makeup Artistry','Professional makeup and beauty training','3 Months','Beauty','Active','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'),
('Hair Styling & Cutting','Professional hair styling techniques','4 Months','Hair','Active','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'),
('Skin Care & Facial Therapy','Advanced skin care treatments','2 Months','Skin','Active','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'),
('Personal Grooming & Styling','Complete grooming solutions','1 Month','Lifestyle','Active','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Yoga & Mindfulness','Holistic wellness through yoga','3 Months','Wellness','Active','https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400');


INSERT INTO `students` (`name`,`email`,`phone`,`course_id`,`status`) VALUES
('mohit sharma','mohit637520@gmail.com','+91-9876543210',1,'Active');

INSERT INTO `certificates` (`student_id`,`course_id`,`certificate_code`,`issue_date`,`status`) VALUES
(1,1,'CERT-2024-001','2024-01-15','Issued');

INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`status`) VALUES
('Beauty Training Session','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400','Beauty',1,'Active'),
('Professional Hair Styling','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400','Beauty',2,'Active'),
('Makeup Workshop','https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400','Beauty',3,'Active'),
('Wellness Class','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400','Wellness',4,'Active'),
('Grooming Session','https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400','Lifestyle',5,'Active'),
('Academy Campus','https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400','Events',6,'Active');

INSERT INTO `partners` (`name`,`logo`,`website`,`description`,`sort_order`,`status`) VALUES
('Lakme Salon','https://via.placeholder.com/150x80?text=Lakme','https://www.lakmesalon.in','Leading beauty salon chain',1,'Active'),
('VLCC','https://via.placeholder.com/150x80?text=VLCC','https://www.vlccwellness.com','Wellness and beauty experts',2,'Active'),
('Naturals','https://via.placeholder.com/150x80?text=Naturals','https://www.naturals.in','Professional salon services',3,'Active'),
('Jawed Habib','https://via.placeholder.com/150x80?text=Jawed+Habib','https://www.jawedhabib.com','Celebrity hair stylist chain',4,'Active'),
('Green Trends','https://via.placeholder.com/150x80?text=Green+Trends','https://www.greentrends.in','Modern unisex salon',5,'Active'),
('YLG Salon','https://via.placeholder.com/150x80?text=YLG','https://www.ylgsalons.com','Premium salon services',6,'Active');

INSERT INTO `blogs` (`title`,`excerpt`,`content`,`image`,`author`,`category`,`status`) VALUES
('10 Essential Makeup Tips for Beginners','Master the basics of makeup application with these professional tips that will transform your beauty routine...','Complete guide to makeup basics for beginners.','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400','Poppik Team','Beauty','Published'),
('Building Confidence Through Personal Grooming','Discover how personal grooming impacts your professional presence and opens doors to new opportunities...','Learn the importance of personal grooming in professional life.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400','Poppik Team','Lifestyle','Published'),
('Mindfulness Practices for Daily Balance','Simple mindfulness techniques to incorporate into your routine for better mental and emotional wellbeing...','Guide to daily mindfulness practices for wellness.','https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400','Poppik Team','Wellness','Published');

-- Optional: add initial settings
INSERT INTO `settings` (`setting_key`,`setting_value`) VALUES
('site_name','Poppik Academy');

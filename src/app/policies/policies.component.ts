
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.css']
})
export class PoliciesComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }
  policies = [
    {
      id: 'disclaimer',
      icon: '⚠️',
      title: 'Disclaimer',
      content: 'The content provided on Poppik Academy website, courses, blogs, and videos is for educational and informational purposes only. We strive for accuracy but do not guarantee completeness or outcomes. Users are responsible for their own application of skills and knowledge.'
    },
    {
      id: 'terms-of-use',
      icon: '📋',
      title: 'Terms of Use',
      intro: 'By accessing or using Poppik Academy\'s website and services, you agree to:',
      points: [
        'Use content only for personal, educational purposes.',
        'Not copy, distribute, or sell any materials without permission.',
        'Comply with all applicable laws and regulations.'
      ],
      footer: 'Violation may result in access restriction or legal action.'
    },
    {
      id: 'privacy',
      icon: '🔒',
      title: 'Privacy Policy',
      intro: 'We respect your privacy. Any personal information collected (name, email, contact, course enrollment) will be:',
      points: [
        'Used solely for course delivery, updates, and communication.',
        'Not shared or sold to third parties.',
        'Stored securely with industry-standard practices.'
      ]
    },
    {
      id: 'profanity',
      icon: '🚫',
      title: 'Profanity Policy',
      intro: 'Poppik Academy maintains a respectful learning environment.',
      points: [
        'Offensive, abusive, or derogatory language in forums, comments, or chats is strictly prohibited.',
        'Violation may result in warnings, content removal, or account suspension.'
      ]
    },
    {
      id: 'refund',
      icon: '💰',
      title: 'Refund & Cancellation Policy',
      intro: 'We want you to be fully satisfied with your learning experience. Our policy includes:',
      points: [
        'Refunds available only within the stated period from enrollment.',
        'Cancellation requests must be submitted via email or contact form.',
        'Refunds are processed after deducting applicable administrative fees.',
        'Certain courses or materials may be non-refundable, as specified.'
      ]
    },
    {
      id: 'terms-conditions',
      icon: '📜',
      title: 'Terms & Conditions',
      intro: 'By enrolling or accessing our courses:',
      points: [
        'You agree to follow course rules and guidelines.',
        'Course content is copyright-protected.',
        'Unauthorized sharing, recording, or distribution is prohibited.',
        'Poppik Academy reserves the right to modify courses, schedules, and policies without prior notice.'
      ]
    },
    {
      id: 'grievance',
      icon: '📞',
      title: 'Grievance Redressal',
      intro: 'We value your feedback and complaints. To file a grievance:',
      contact: {
        officer: 'Hanmnt Dadas',
        email: 'hanmnt@poppik.in',
        phone: '+91-7039011291'
      },
      footer: 'Our team will respond within 7 working days. All grievances are handled confidentially and fairly, aiming for prompt resolution.'
    }
  ];

  scrollToPolicy(policyId: string) {
    const element = document.getElementById(policyId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

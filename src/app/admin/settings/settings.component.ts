import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  settings = {
    siteName: 'Poppik Academy',
    siteEmail: 'info@poppikacademy.com',
    sitePhone: '+91 1234567890',
    siteAddress: 'New Delhi, India',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: ''
  };

  saveSettings() {
    console.log('Settings saved:', this.settings);
  }
}

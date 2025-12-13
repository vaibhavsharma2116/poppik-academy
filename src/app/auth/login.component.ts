import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  remember = false;

  constructor(private router: Router) {}

  login() {
    // Demo stub: replace with real auth integration
    if (!this.email || !this.password) {
      alert('Please enter email and password');
      return;
    }
    alert('Logged in (demo) — ' + this.email);
    this.router.navigate(['/']);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}

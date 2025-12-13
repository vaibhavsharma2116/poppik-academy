import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirm = '';

  constructor(private router: Router) {}

  signup() {
    if (!this.name || !this.email || !this.password) {
      alert('Please fill all required fields');
      return;
    }
    if (this.password !== this.confirm) {
      alert('Passwords do not match');
      return;
    }
    alert('Account created (demo) — ' + this.email);
    this.router.navigate(['/login']);
  }
}

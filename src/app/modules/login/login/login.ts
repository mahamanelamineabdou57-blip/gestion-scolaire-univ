import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      matricule: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.loginForm.valid) {
      const { matricule, password } = this.loginForm.value;
      this.authService.login(matricule, password);
      this.router.navigate(['/dashboard']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authService.user.set(null);
    this.router.navigate(['/login']);
  }
  // submit(): void {
  //   if (this.loginForm.valid) {
  //     const { matricule, password } = this.loginForm.value;
  //     this.authService.login(matricule, password).subscribe({
  //       next: () => this.router.navigate(['/dashboard']),
  //       error: (err) => {
  //         this.errorMessage = err?.error?.message || 'Erreur de connexion';
  //       }
  //     });
  //   } else {
  //     this.loginForm.markAllAsTouched();
  //   }
  // }
}

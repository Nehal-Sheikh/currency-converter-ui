import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { HistoryService } from '../../core/services/history.service';
import { AutoFocusDirective } from '../../shared/directives/auto-focus.directive';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    AutoFocusDirective, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="auth-container container">
      <mat-card class="auth-card-wrapper glass-card">
        <mat-card-content>
          <div class="auth-header">
            <h2 class="gradient-text">{{ isLogin() ? 'Welcome Back' : 'Create Account' }}</h2>
            <p>{{ isLogin() ? 'Login to sync your history across devices.' : 'Join us for a better experience.' }}</p>
          </div>

          <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
            <div class="input-group" *ngIf="!isLogin()">
              <mat-form-field appearance="outline" class="full-width auth-field" subscriptSizing="dynamic" hideRequiredMarker="true">
                <mat-label>Full Name</mat-label>
                <input matInput type="text" formControlName="name" appAutoFocus>
                <mat-error *ngIf="authForm.get('name')?.hasError('required')">
                  Full name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="input-group">
              <mat-form-field appearance="outline" class="full-width auth-field" subscriptSizing="dynamic" hideRequiredMarker="true">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-error *ngIf="authForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="authForm.get('email')?.hasError('email')">
                  Invalid email format
                </mat-error>
              </mat-form-field>
            </div>

            <div class="input-group">
              <mat-form-field appearance="outline" class="full-width auth-field" subscriptSizing="dynamic" hideRequiredMarker="true">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password">
                <mat-error *ngIf="authForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="authForm.get('password')?.hasError('minlength')">
                  Minimum 8 characters required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="error-container" *ngIf="error()">
              <p class="error-msg">{{ error() }}</p>
            </div>

            <button mat-raised-button color="primary" type="submit" class="w-full btn-auth-mat" [disabled]="loading()">
              <span *ngIf="!loading()">{{ isLogin() ? 'Login' : 'Sign Up' }}</span>
              <span *ngIf="loading()">Processing...</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>
              {{ isLogin() ? "Don't have an account?" : "Already have an account?" }}
              <button mat-button color="primary" (click)="toggleMode()" class="mode-toggle-btn">
                {{ isLogin() ? 'Sign Up' : 'Login' }}
              </button>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .auth-card-wrapper {
      width: 100%;
      max-width: 420px;
      padding: 24px;
      border-radius: 24px !important;
      background: var(--bg-card) !important;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-header h2 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .auth-header p {
      color: var(--text-secondary);
      font-size: 15px;
    }
    .input-group {
      margin-bottom: 24px;
    }
    
    /* Clean Auth Field Alignment */
    ::ng-deep .auth-field .mat-mdc-text-field-wrapper {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
    ::ng-deep .auth-field .mat-mdc-input-element {
      text-align: left !important;
    }
    
    ::ng-deep mat-error {
      color: #ff4d4d !important;
      margin-top: 8px !important;
      display: block !important;
      font-weight: 600;
      font-size: 13px;
    }
    
    .error-container {
      margin-bottom: 20px;
      padding: 12px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .error-msg {
      color: var(--error);
      font-size: 14px;
      text-align: center;
      margin: 0;
    }
    .btn-auth-mat {
      height: 54px !important;
      font-size: 16px !important;
      font-weight: 800 !important;
      border-radius: 16px !important;
      margin-top: 12px;
      letter-spacing: 1px !important;
      text-transform: uppercase !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4) !important;
    }
    .btn-auth-mat:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6) !important;
    }
    .auth-footer {
      margin-top: 32px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 15px;
    }
    .mode-toggle-btn {
      font-weight: 800 !important;
      margin-left: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .w-full { width: 100%; display: block; }
  `]
})
export class AuthComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private historyService = inject(HistoryService);
  private router = inject(Router);

  isLogin = signal(true);
  loading = signal(false);
  error = signal('');
  
  authForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['']
    });
  }

  toggleMode() {
    this.isLogin.set(!this.isLogin());
    this.error.set('');

    const nameControl = this.authForm.get('name');
    if (!this.isLogin()) {
      nameControl?.setValidators([Validators.required]);
    } else {
      nameControl?.clearValidators();
    }
    nameControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password, name } = this.authForm.value;
    const action = this.isLogin() 
      ? this.authService.login({ email, password })
      : this.authService.register({ email, password, name });

    action.subscribe({
      next: () => {
        this.historyService.mergeGuestHistory().subscribe(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Authentication failed');
        this.loading.set(false);
      }
    });
  }
}


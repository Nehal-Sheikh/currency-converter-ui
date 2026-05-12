import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { GlassmorphismDirective } from '../directives/glassmorphism.directive';
import { LucideAngularModule, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    GlassmorphismDirective, 
    LucideAngularModule,
    MatButtonModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar class="navbar glass-navbar" appGlassmorphism [opacity]="0.8" [blur]="15">
      <div class="container nav-content">
        <a routerLink="/" class="logo">
          <span class="gradient-text">Currency</span> Converter
        </a>

        <button mat-icon-button class="hamburger" (click)="toggleMenu()" aria-label="Toggle menu">
          <lucide-icon [name]="isMenuOpen() ? closeIcon : menuIcon"></lucide-icon>
        </button>
        
        <div class="nav-links" [class.open]="isMenuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()" mat-button>Converter</a>
          <a routerLink="/history" routerLinkActive="active" (click)="closeMenu()" mat-button>History</a>
          
          <ng-container *ngIf="auth.currentUser() as user; else guest">
            <div class="user-info">
              <span class="user-badge">{{ user.name }}</span>
              <button mat-button color="warn" (click)="logout()" class="btn-logout-mat">Logout</button>
            </div>
          </ng-container>
          
          <ng-template #guest>
            <a routerLink="/login" mat-stroked-button color="primary" (click)="closeMenu()" class="btn-auth-mat">Login</a>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      margin: 20px auto;
      height: 70px;
      display: flex;
      align-items: center;
      position: sticky;
      top: 20px;
      z-index: 1000;
      max-width: 1200px;
      width: calc(100% - 40px);
    }
    .nav-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      text-decoration: none;
      color: white;
      z-index: 1002;
    }
    .hamburger {
      display: none;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      z-index: 1002;
      padding: 8px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-links a {
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      transition: color 0.3s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: white;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-badge {
      background: rgba(255, 255, 255, 0.05);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-auth-mat {
      border-radius: 12px !important;
      font-weight: 700 !important;
      border-width: 2px !important;
      padding: 0 24px !important;
      transition: all 0.3s ease !important;
    }
    .btn-auth-mat:hover {
      background: rgba(99, 102, 241, 0.1) !important;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
      transform: translateY(-1px);
    }
    .btn-logout-mat {
      border-radius: 12px !important;
      font-weight: 700 !important;
      border: none !important;
      background: rgba(239, 68, 68, 0.1) !important;
      color: #ff4d4d !important;
      transition: all 0.3s ease !important;
    }
    .btn-logout-mat:focus, .btn-logout-mat:active {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
    }
    .btn-logout-mat:hover {
      background: rgba(239, 68, 68, 0.25) !important;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nav-links {
        position: absolute;
        top: 80px;
        right: 0;
        width: 260px;
        height: auto;
        padding: 30px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        transform: translateY(-10px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1001;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      }
      .nav-links.open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
      .user-info {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
      }
      .user-badge {
        width: 100%;
        text-align: center;
        margin-bottom: 12px;
      }
      .btn-logout {
        width: 100%;
      }
      .btn-auth {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  readonly menuIcon = Menu;
  readonly closeIcon = X;

  constructor(public auth: AuthService) {}

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
  }
}


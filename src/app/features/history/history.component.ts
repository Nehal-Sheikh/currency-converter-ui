import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HistoryService } from '../../core/services/history.service';
import { HistoryRecord } from '../../shared/models/history.model';
import { LucideAngularModule, History, ArrowRight, Calendar, Trash2, Database, User, Plus } from 'lucide-angular';
import { GlassmorphismDirective } from '../../shared/directives/glassmorphism.directive';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { CurrencyFormatterPipe } from '../../shared/pipes/currency-formatter.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule,
    RelativeTimePipe, 
    MatCardModule,
    MatButtonModule,
    CurrencyFormatterPipe
  ],
  template: `
    <div class="history-container container">
      <div class="header">
        <h1 class="gradient-text">Conversion History</h1>
        <p>Review your recent activity and saved conversions.</p>
      </div>

      <div class="history-list animate-in" *ngIf="history().length > 0; else empty">
        <mat-card class="history-item-card glass-card" *ngFor="let item of history(); let i = index" [style.animation-delay]="i * 100 + 'ms'">
          <mat-card-content>
            <div class="item-main">
              <div class="top-row">
                <div class="currency-pair">
                  <span class="from">{{ item.amount | number:'1.2-2' }} {{ item.fromCurrency }}</span>
                  <lucide-icon [name]="arrowIcon" class="arrow"></lucide-icon>
                  <span class="to gradient-text">{{ item.result | currencyFormat:item.toCurrency }}</span>
                </div>
                <div class="source-badge" [class.synced]="item.source === 'synced'">
                  <lucide-icon [name]="item.source === 'synced' ? dbIcon : userIcon" class="mini-icon"></lucide-icon>
                  {{ item.source === 'synced' ? 'Synced' : 'Guest' }}
                </div>
              </div>
              
              <div class="meta">
                <span class="rate">Rate: {{ item.exchangeRate | number:'1.4-4' }}</span>
                <span class="divider">•</span>
                <div class="date-container">
                  <div class="relative-date">
                    <lucide-icon [name]="calendarIcon" class="mini-icon"></lucide-icon>
                    {{ item.timestamp | relativeTime }}
                  </div>
                  <span class="absolute-date">({{ item.timestamp | date:'short' }})</span>
                </div>
                <span *ngIf="item.historicalDate" class="historical-badge">
                  Historical: {{ item.historicalDate }}
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #empty>
        <mat-card class="empty-state-card glass-card">
          <mat-card-content class="empty-state">
            <lucide-icon [name]="historyIcon" class="empty-icon"></lucide-icon>
            <h3>No history yet</h3>
            <p>Your conversions will appear here.</p>
            <button mat-flat-button color="primary" class="mt-24" (click)="navigateToConverter()">
              <lucide-icon [name]="plusIcon" class="btn-icon-left"></lucide-icon>
              Start Converting
            </button>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 60px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 48px;
    }
    .header h1 {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .header p {
      color: var(--text-secondary);
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    .history-item-card {
      display: block;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
      animation: fadeInUp 0.5s ease-out both;
    }
    .history-item-card:hover {
      transform: translateX(12px) scale(1.02);
      box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.3);
    }
    .item-main {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .currency-pair {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 600;
    }
    .arrow {
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
    }
    .source-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .source-badge.synced {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.2);
    }
    .meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .date-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .relative-date {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .absolute-date {
      font-size: 12px;
      opacity: 0.6;
    }
    .mini-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
    }
    .historical-badge {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
    }
    .empty-state-card {
      max-width: 600px;
      margin: 0 auto;
      display: block;
    }
    .empty-state {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      opacity: 0.5;
    }
    .empty-state h3 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .mt-24 { margin-top: 24px; }
    .btn-icon-left { width: 18px; height: 18px; margin-right: 8px; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryService);
  private router = inject(Router);

  history = this.historyService.history;

  readonly arrowIcon = ArrowRight;
  readonly calendarIcon = Calendar;
  readonly historyIcon = History;
  readonly dbIcon = Database;
  readonly userIcon = User;
  readonly plusIcon = Plus;

  ngOnInit() {
    this.historyService.loadInitialHistory();
  }

  navigateToConverter() {
    this.router.navigate(['/']);
  }
}




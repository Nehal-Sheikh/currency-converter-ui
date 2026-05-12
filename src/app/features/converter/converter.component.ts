import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CurrencyService } from '../../core/services/currency.service';
import { HistoryService } from '../../core/services/history.service';
import { Currency } from '../../shared/models/currency.model';
import { LucideAngularModule, ArrowLeftRight, Calendar, Calculator, X } from 'lucide-angular';
import { debounceTime, Subject } from 'rxjs';
import { GlassmorphismDirective } from '../../shared/directives/glassmorphism.directive';
import { AutoFocusDirective } from '../../shared/directives/auto-focus.directive';
import { CurrencyHighlightDirective } from '../../shared/directives/currency-highlight.directive';
import { SkeletonLoaderDirective } from '../../shared/directives/skeleton-loader.directive';
import { CurrencyFormatterPipe } from '../../shared/pipes/currency-formatter.pipe';
import { TrendChartComponent } from '../../shared/components/trend-chart.component';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    LucideAngularModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    AutoFocusDirective,
    CurrencyHighlightDirective,
    SkeletonLoaderDirective,
    CurrencyFormatterPipe,
    TrendChartComponent
  ],
  template: `
    <div class="converter-container container">
      <div class="hero-section">
        <h1 class="gradient-text">Master Your Money</h1>
        <p>Real-time currency conversion with historical insights.</p>
      </div>

      <div class="converter-stack">
        <mat-card class="converter-card glass-card">
          <mat-card-content>
            <div class="converter-main-row">
              <mat-form-field appearance="outline" class="amount-field">
                <mat-label>Amount</mat-label>
                <input matInput type="number" [(ngModel)]="amount" (ngModelChange)="convertSubject.next($event)" placeholder="0.00" appAutoFocus class="amount-input">
              </mat-form-field>

              <div class="currency-selectors">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>From</mat-label>
                  <input type="text"
                         matInput
                         [matAutocomplete]="fromAuto"
                         [(ngModel)]="from"
                         (input)="filterFromCurrencies($event)"
                         (focus)="onInputFocus('from')">
                  <mat-autocomplete #fromAuto="matAutocomplete" (optionSelected)="onOptionSelected($event, 'from')">
                    <mat-option *ngFor="let c of filteredFromCurrencies()" [value]="c.code">
                      <div class="option-content">
                        <img [src]="getFlagUrl(c.code)" class="flag-icon" (error)="onFlagError($event)">
                        <span>{{ c.code }} - {{ c.name }}</span>
                      </div>
                    </mat-option>
                  </mat-autocomplete>
                </mat-form-field>

                <button mat-icon-button (click)="swap()" class="swap-btn-mat" [class.rotating]="isRotating">
                  <lucide-icon [name]="swapIcon"></lucide-icon>
                </button>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>To</mat-label>
                  <input type="text"
                         matInput
                         [matAutocomplete]="toAuto"
                         [(ngModel)]="to"
                         (input)="filterToCurrencies($event)"
                         (focus)="onInputFocus('to')">
                  <mat-autocomplete #toAuto="matAutocomplete" (optionSelected)="onOptionSelected($event, 'to')">
                    <mat-option *ngFor="let c of filteredToCurrencies()" [value]="c.code">
                      <div class="option-content">
                        <img [src]="getFlagUrl(c.code)" class="flag-icon" (error)="onFlagError($event)">
                        <span>{{ c.code }} - {{ c.name }}</span>
                      </div>
                    </mat-option>
                  </mat-autocomplete>
                </mat-form-field>
              </div>
            </div>

            <mat-form-field appearance="outline" class="full-width date-field-mat" (click)="picker.open()">
              <mat-label>Choose a date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="date" (dateChange)="onConvert()" readonly>
              
              <!-- "X" button to clear the date -->
              <lucide-icon 
                *ngIf="date" 
                matSuffix 
                [name]="xIcon"
                (click)="clearDate(); $event.stopPropagation()" 
                class="clear-icon-mat">
              </lucide-icon>
              
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <div class="result-area" *ngIf="result() > 0 || loading() || warning()">
              <div *ngIf="loading()" class="loader-container">
                <div class="skeleton-result" [appSkeleton]="loading()"></div>
              </div>
              
              <div *ngIf="!loading() && (result() > 0 || warning())" class="result-content animate-in" appCurrencyHighlight [triggerValue]="result()">
                <div class="main-result" *ngIf="result() > 0">
                  <span class="amount">{{ amount | number:'1.2-2' }} {{ from }}</span>
                  <span class="equals">=</span>
                  <span class="converted gradient-text">{{ result() | currencyFormat:to }}</span>
                </div>
                <p class="rate-info" *ngIf="result() > 0">1 {{ from }} = {{ rate() | number:'1.4-4' }} {{ to }}</p>
                <p *ngIf="warning()" class="warning-text">{{ warning() }}</p>
                <p *ngIf="date && result() > 0" class="historical-note">Historical Rate from {{ date | date:'mediumDate' }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <app-trend-chart 
          [fromCurrency]="from" 
          [toCurrency]="to" 
          [trendData]="trends()" 
          [isLoading]="trendsLoading()">
        </app-trend-chart>
      </div>
    </div>
  `,

  styles: [`
    .converter-container {
      padding: 60px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-section {
      text-align: center;
      margin-bottom: 64px; /* Increased space between text and card */
      width: 100%;
      padding: 0 20px;
    }
    .hero-section h1 {
      font-size: clamp(2.5rem, 10vw, 4.5rem); /* Highly responsive fluid typography */
      font-weight: 800;
      margin-bottom: 16px;
      line-height: 1.1;
    }
    .hero-section p {
      color: var(--text-secondary);
      font-size: clamp(1rem, 4vw, 1.25rem);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .main-result {
      display: flex;
      flex-wrap: wrap; /* Allow wrapping on small screens */
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: clamp(20px, 6vw, 32px);
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    .converter-main-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 8px;
    }
    .amount-field {
      flex: 1; /* Amount takes less space */
    }
    .currency-selectors {
      flex: 2.5; /* Currency selectors take more space */
      display: flex;
      gap: 12px;
    }
    .date-field {
      margin-top: 8px;
    }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }
    
    @media (max-width: 992px) {
      .converter-main-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
    }
    :host ::ng-deep .mat-mdc-form-field-infix {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 12px 0 !important;
      min-height: 56px !important;
    }
    :host ::ng-deep .mat-mdc-input-element {
      text-align: center !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    :host ::ng-deep .mat-mdc-form-field-label-wrapper {
      width: 100% !important;
      text-align: center !important;
    }
    
    .amount-input {
      font-weight: 600 !important;
    }
    /* Hide number input spinners */
    .amount-input::-webkit-outer-spin-button,
    .amount-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .amount-input[type=number] {
      -moz-appearance: textfield;
    }
    .option-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .flag-icon {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border-radius: 2px;
      background: rgba(255,255,255,0.1);
    }
    .result-area {
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid var(--glass-border);
      text-align: center;
      min-height: 120px;
    }
    .rate-info {
      color: var(--text-secondary);
      font-size: 16px;
    }
    .warning-text {
      color: var(--warning);
      font-size: 14px;
      margin-top: 12px;
    }
    .historical-note {
      color: var(--primary);
      font-size: 13px;
      margin-top: 8px;
      font-weight: 500;
    }
    .skeleton-result {
      height: 80px;
      width: 80%;
      margin: 0 auto;
      border-radius: 12px;
    }
    .animate-in {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .converter-card {
      background: var(--bg-card) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 24px !important;
      padding: 24px;
      overflow: hidden;
    }
    .swap-btn-mat {
      color: var(--text-primary) !important;
      background: rgba(255, 255, 255, 0.05) !important;
      margin-top: 10px;
    }
    .swap-btn-mat:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }
    .rotating {
      animation: rotate 0.5s ease-in-out;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(180deg); }
    }
    @media (max-width: 768px) {
      .hero-section {
        margin-bottom: 24px;
      }
      .converter-container {
        padding: 40px 0;
      }
      .currency-selectors {
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }
      .swap-btn-mat {
        transform: rotate(90deg);
        margin: 8px 0;
      }
      .main-result {
        flex-direction: column;
        gap: 4px;
      }
      .equals {
        transform: rotate(90deg);
        margin: 4px 0;
        font-size: 24px;
      }
    }
    .clear-btn-inline {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: all 0.2s;
    }
    .clear-btn-inline.prefix {
      margin-left: 8px;
      margin-right: -4px;
    }
    .clear-btn-inline:hover {
      opacity: 1;
      color: var(--error);
      transform: scale(1.1);
    }
    .clear-btn-inline lucide-icon {
      width: 18px;
      height: 18px;
    }
    /* Autocomplete Panel Styling */
    ::ng-deep .mat-mdc-autocomplete-panel {
      background: #1e293b !important; /* Solid dark background */
      border: 1px solid var(--glass-border) !important;
      border-radius: 12px !important;
      margin-top: 4px !important;
    }
    ::ng-deep .mat-mdc-option {
      color: var(--text-primary) !important;
      transition: background 0.2s ease !important;
    }
    ::ng-deep .mat-mdc-option:hover:not(.mdc-list-item--disabled),
    ::ng-deep .mat-mdc-option.mat-mdc-option-active,
    ::ng-deep .mat-mdc-option.mdc-list-item--selected:not(.mdc-list-item--disabled) {
      background: rgba(99, 102, 241, 0.2) !important; /* Indigo tint */
    }
    /* Ensure text stays visible on hover */
    ::ng-deep .mat-mdc-option:hover .mdc-list-item__primary-text {
      color: white !important;
    }
    
    .date-field-mat {
      cursor: pointer;
    }
    ::ng-deep .date-field-mat .mat-mdc-form-field-flex {
      cursor: pointer !important;
      align-items: center !important;
    }
    ::ng-deep .date-field-mat .mat-mdc-form-field-infix {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
    }
    ::ng-deep .date-field-mat .mat-mdc-form-field-suffix {
      display: flex !important;
      align-items: center !important;
      gap: 4px;
    }
    .clear-icon-mat {
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;
      width: 18px !important;
      height: 18px !important;
    }
    .clear-icon-mat:hover {
      color: var(--error);
      transform: scale(1.1);
    }
    
    .converter-stack {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
      max-width: 800px; /* Focus width */
      margin: 0 auto;
    }
    @media (max-width: 850px) {
      .converter-stack {
        max-width: 95%;
      }
    }
  `]
})
export class ConverterComponent implements OnInit {
  currencies = signal<Currency[]>([]);
  amount = 1;
  from = 'USD';
  to = 'EUR';
  date: Date | null = null;
  
  result = signal<number>(0);
  rate = signal<number>(0);
  warning = signal<string>('');
  loading = signal<boolean>(false);
  isRotating = false;

  trends = signal<any[]>([]);
  trendsLoading = signal<boolean>(false);

  fromFilter = signal<string>('');
  toFilter = signal<string>('');

  filteredFromCurrencies = computed(() => {
    const filter = this.fromFilter().toLowerCase();
    return this.currencies().filter(c => 
      c.code.toLowerCase().includes(filter) || c.name.toLowerCase().includes(filter)
    );
  });

  filteredToCurrencies = computed(() => {
    const filter = this.toFilter().toLowerCase();
    return this.currencies().filter(c => 
      c.code.toLowerCase().includes(filter) || c.name.toLowerCase().includes(filter)
    );
  });

  convertSubject = new Subject<number>();

  readonly swapIcon = ArrowLeftRight;
  readonly calendarIcon = Calendar;
  readonly calcIcon = Calculator;
  readonly xIcon = X;

  constructor(
    private currencyService: CurrencyService,
    private historyService: HistoryService
  ) {
    this.convertSubject.pipe(debounceTime(500)).subscribe(() => this.onConvert());
  }

  ngOnInit() {
    this.currencyService.getSupportedCurrencies().subscribe(res => {
      this.currencies.set(res.data);
      this.onConvert(false);
    });
  }

  getFlagUrl(code: string): string {
    const countryCode = code.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${countryCode}.png`;
  }

  onFlagError(event: any) {
    event.target.style.display = 'none';
  }

  filterFromCurrencies(event: Event) {
    this.fromFilter.set((event.target as HTMLInputElement).value);
  }

  filterToCurrencies(event: Event) {
    this.toFilter.set((event.target as HTMLInputElement).value);
  }

  onCurrencyChange(type: 'from' | 'to') {
    this.onConvert();
  }

  onOptionSelected(event: any, type: 'from' | 'to') {
    if (type === 'from') {
      this.from = event.option.value;
      this.fromFilter.set('');
    } else {
      this.to = event.option.value;
      this.toFilter.set('');
    }
    this.onConvert();
  }

  onInputFocus(type: 'from' | 'to') {
    if (type === 'from') this.fromFilter.set('');
    else this.toFilter.set('');
  }

  onConvert(saveToHistory: boolean = true) {
    if (!this.amount || this.amount <= 0) return;
    this.loading.set(true);
    
    const formattedDate = this.date ? this.date.toISOString().split('T')[0] : '';
    
    const obs = formattedDate 
      ? this.currencyService.getHistoricalRate(this.from, this.to, this.amount, formattedDate)
      : this.currencyService.getLatestRate(this.from, this.to, this.amount);

    obs.subscribe({
      next: (res) => {
        this.result.set(res.data.result);
        this.rate.set(res.data.rate);
        this.warning.set(res.data.warning || '');
        this.loading.set(false);
        
        if (saveToHistory) {
          this.historyService.saveConversion({
            fromCurrency: this.from,
            toCurrency: this.to,
            amount: this.amount,
            result: res.data.result,
            exchangeRate: res.data.rate,
            historicalDate: formattedDate || undefined,
            timestamp: new Date().toISOString()
          }).subscribe();
        }

        this.fetchTrends();
      },
      error: (err) => {
        this.loading.set(false);
        this.result.set(0);
        this.rate.set(0);
        
        if (this.date) {
          const dateStr = this.date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
          this.warning.set(`Historical Rate unavailable of ${dateStr}`);
        } else {
          this.warning.set('Exchange rate service unavailable');
        }
      }
    });
  }

  fetchTrends() {
    this.trendsLoading.set(true);
    this.currencyService.getTrends(this.from, this.to).subscribe({
      next: (data) => {
        this.trends.set(data);
        this.trendsLoading.set(false);
      },
      error: () => this.trendsLoading.set(false)
    });
  }

  swap() {
    this.isRotating = true;
    const temp = this.from;
    this.from = this.to;
    this.to = temp;
    
    setTimeout(() => {
      this.isRotating = false;
      this.onConvert();
    }, 500);
  }

  clearDate() {
    this.date = null;
    this.onConvert();
  }
}




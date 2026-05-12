import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';
import { GlassmorphismDirective } from '../directives/glassmorphism.directive';

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule, GlassmorphismDirective],
  template: `
    <div class="chart-wrapper" appGlassmorphism>
      <div class="chart-header">
        <div class="title-row">
          <lucide-icon [name]="trendIcon" class="title-icon"></lucide-icon>
          <h3>7-Day Price Trend</h3>
        </div>
        <p class="subtitle">{{ fromCurrency }} to {{ toCurrency }}</p>
      </div>

      <div class="chart-container">
        <canvas baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="lineChartType">
        </canvas>
      </div>
      
      <div *ngIf="loading()" class="chart-overlay">
        <div class="loader"></div>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      padding: 24px;
      margin-top: 24px;
      position: relative;
      min-height: 300px;
    }
    .chart-header {
      margin-bottom: 20px;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .title-icon {
      width: 20px;
      height: 20px;
      color: var(--primary);
    }
    .chart-header h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
    }
    .chart-container {
      height: 200px;
      width: 100%;
    }
    .chart-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 24px;
    }
    .loader {
      width: 30px;
      height: 30px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TrendChartComponent implements OnChanges {
  @Input() fromCurrency = '';
  @Input() toCurrency = '';
  @Input() trendData: any[] = [];
  @Input() isLoading = false;

  loading = signal(false);
  readonly trendIcon = TrendingUp;

  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Exchange Rate',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: []
  };

  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      y: {
        display: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      x: {
        display: true,
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  lineChartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trendData'] && this.trendData) {
      this.updateChart();
    }
    if (changes['isLoading']) {
      this.loading.set(this.isLoading);
    }
  }

  private updateChart() {
    this.lineChartData = {
      ...this.lineChartData,
      labels: this.trendData.map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })),
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: this.trendData.map(d => d.rate)
        }
      ]
    };
  }
}

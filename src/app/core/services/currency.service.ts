import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SupportedCurrenciesResponse, LatestRateResponse } from '../../shared/models/currency.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = `${environment.apiUrl}/currency`;

  constructor(private http: HttpClient) {}

  getSupportedCurrencies(): Observable<SupportedCurrenciesResponse> {
    return this.http.get<SupportedCurrenciesResponse>(`${this.apiUrl}/supported`);
  }

  getLatestRate(from: string, to: string, amount: number): Observable<LatestRateResponse> {
    return this.http.get<LatestRateResponse>(`${this.apiUrl}/latest`, {
      params: { from, to, amount: amount.toString() }
    });
  }

  getHistoricalRate(from: string, to: string, amount: number, date: string): Observable<LatestRateResponse> {
    return this.http.get<LatestRateResponse>(`${this.apiUrl}/historical`, {
      params: { from, to, amount: amount.toString(), date }
    });
  }

  getTrends(from: string, to: string): Observable<any[]> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/trends`, {
      params: { from, to }
    }).pipe(
      map(res => res.data)
    );
  }
}



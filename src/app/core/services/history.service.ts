import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, map } from 'rxjs';

import { HistoryRecord, HistoryResponse } from '../../shared/models/history.model';
import { AuthService } from './auth.service';
import { GuestHistoryService } from './guest-history.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/history`;
  private _history = signal<HistoryRecord[]>([]);

  history = this._history.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private guestHistoryService: GuestHistoryService
  ) {}

  loadInitialHistory() {
    if (this.authService.isAuthenticated()) {
      this.getUserHistory().subscribe();
    } else {
      this._history.set(this.guestHistoryService.history());
    }
  }

  getUserHistory(): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(this.apiUrl).pipe(
      map(res => ({
        ...res,
        data: res.data.map(item => ({ ...item, source: 'synced' as const }))
      })),
      tap(res => this._history.set(res.data))
    );
  }


  saveConversion(record: Partial<HistoryRecord>): Observable<any> {
    if (this.authService.isAuthenticated()) {
      return this.http.post(this.apiUrl, record).pipe(
        tap(() => this.getUserHistory().subscribe())
      );
    } else {
      this.guestHistoryService.saveRecord(record);
      this._history.set(this.guestHistoryService.history());
      return of(record);
    }
  }

  mergeGuestHistory(): Observable<HistoryResponse> {
    const records = this.guestHistoryService.getRecords().map(({ id, source, ...rest }) => rest);
    if (records.length === 0) return this.getUserHistory();

    return this.http.post<HistoryResponse>(`${this.apiUrl}/bulk`, { records }).pipe(
      tap(res => {
        this._history.set(res.data);
        this.guestHistoryService.clear();
      })
    );
  }
}
